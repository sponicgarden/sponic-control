"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  STATUS_LABELS,
  PRIORITY_LABELS,
  getCurrentAppUser,
  logActivity,
  type TaskPriority,
  type TaskStatus,
  type TaskWithRelations,
} from "@/lib/tasks";
import { useTasksData } from "@/hooks/use-tasks";
import { TaskStatsBar } from "./task-stats-bar";
import { TaskFilters, DEFAULT_FILTERS, type TaskFiltersState } from "./task-filters";
import { TasksTable } from "./tasks-table";
import { TaskDetailDrawer, type TaskFormState } from "./task-detail-drawer";

interface Props {
  tab: "list" | "labels" | "projects";
  ProjectManagerComp: React.ComponentType<{ projects: ReturnType<typeof useTasksData>["projects"]; onChanged: () => Promise<void> }>;
  LabelManagerComp: React.ComponentType<{ labels: ReturnType<typeof useTasksData>["labels"]; onChanged: () => Promise<void> }>;
}

export function TasksClient({ tab, ProjectManagerComp, LabelManagerComp }: Props) {
  const data = useTasksData();
  const [filters, setFilters] = useState<TaskFiltersState>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTask, setDrawerTask] = useState<TaskWithRelations | null>(null);

  const filtered = useMemo(() => {
    let out = data.tasks;
    if (!filters.showDone) out = out.filter((t) => t.status !== "done");
    if (filters.search) {
      const q = filters.search.toLowerCase();
      out = out.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description ?? "").toLowerCase().includes(q)
      );
    }
    if (filters.projectId === "") out = out.filter((t) => !t.project_id);
    else if (filters.projectId !== "all") out = out.filter((t) => t.project_id === filters.projectId);
    if (filters.status !== "all") out = out.filter((t) => t.status === filters.status);
    if (filters.priority !== "all") out = out.filter((t) => t.priority === filters.priority);
    if (filters.assigneeId === "unassigned") out = out.filter((t) => !t.assignee_id);
    else if (filters.assigneeId !== "all") out = out.filter((t) => t.assignee_id === filters.assigneeId);
    if (filters.labelId !== "all") out = out.filter((t) => t.labels.some((l) => l.id === filters.labelId));
    return out;
  }, [data.tasks, filters]);

  const openNew = () => {
    setDrawerTask(null);
    setDrawerOpen(true);
  };

  const openTask = (t: TaskWithRelations) => {
    setDrawerTask(t);
    setDrawerOpen(true);
  };

  const handleInlineUpdate = async (
    id: string,
    field: "status" | "priority",
    value: TaskStatus | TaskPriority
  ) => {
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return;
    const me = await getCurrentAppUser();
    const oldVal = task[field];
    const update: Record<string, unknown> = { [field]: value };
    if (field === "status") {
      if (value === "done" && task.status !== "done") {
        update.completed_at = new Date().toISOString();
        update.completed_by = me?.id ?? null;
      } else if (value !== "done" && task.status === "done") {
        update.completed_at = null;
        update.completed_by = null;
      }
    }
    const { error } = await supabase.from("tasks").update(update).eq("id", id);
    if (error) {
      alert(`Failed: ${error.message}`);
      return;
    }
    const labels = field === "status" ? STATUS_LABELS : PRIORITY_LABELS;
    await logActivity(id, me?.id ?? null, field === "status" ? "status_changed" : "edited", {
      old_value: (labels as Record<string, string>)[oldVal],
      new_value: (labels as Record<string, string>)[value],
      metadata: { field },
    });
    if (field === "status" && value === "done") {
      await logActivity(id, me?.id ?? null, "completed");
    }
    await data.reload();
  };

  const handleSave = async (id: string | null, form: TaskFormState) => {
    const me = await getCurrentAppUser();
    const payload: Record<string, unknown> = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      project_id: form.project_id || null,
      assignee_id: form.assignee_id || null,
      due_date: form.due_date || null,
    };

    if (id) {
      const prev = data.tasks.find((t) => t.id === id);
      if (form.status === "done" && prev?.status !== "done") {
        payload.completed_at = new Date().toISOString();
        payload.completed_by = me?.id ?? null;
      } else if (form.status !== "done" && prev?.status === "done") {
        payload.completed_at = null;
        payload.completed_by = null;
      }

      const { error } = await supabase.from("tasks").update(payload).eq("id", id);
      if (error) { alert(`Failed: ${error.message}`); return; }

      // Log notable diffs
      if (prev) {
        if (prev.title !== payload.title) {
          await logActivity(id, me?.id ?? null, "edited", {
            old_value: prev.title, new_value: form.title, metadata: { field: "title" },
          });
        }
        if (prev.status !== form.status) {
          await logActivity(id, me?.id ?? null, "status_changed", {
            old_value: STATUS_LABELS[prev.status], new_value: STATUS_LABELS[form.status],
          });
        }
        if (prev.priority !== form.priority) {
          await logActivity(id, me?.id ?? null, "edited", {
            old_value: PRIORITY_LABELS[prev.priority], new_value: PRIORITY_LABELS[form.priority],
            metadata: { field: "priority" },
          });
        }
        if ((prev.assignee_id ?? "") !== (form.assignee_id ?? "")) {
          const oldAss = data.users.find((u) => u.id === prev.assignee_id);
          const newAss = data.users.find((u) => u.id === form.assignee_id);
          await logActivity(id, me?.id ?? null, "assigned", {
            old_value: oldAss?.display_name || oldAss?.email || (prev.assignee_id ? "(removed)" : null),
            new_value: newAss?.display_name || newAss?.email || (form.assignee_id ? null : "(unassigned)"),
          });
        }
      }

      // Reconcile labels
      const prevLabelIds = prev?.labels.map((l) => l.id) ?? [];
      const added = form.label_ids.filter((x) => !prevLabelIds.includes(x));
      const removed = prevLabelIds.filter((x) => !form.label_ids.includes(x));
      if (added.length) {
        await supabase
          .from("task_label_map")
          .insert(added.map((label_id) => ({ task_id: id, label_id })));
        for (const lid of added) {
          const lbl = data.labels.find((l) => l.id === lid);
          await logActivity(id, me?.id ?? null, "label_added", { new_value: lbl?.name ?? lid });
        }
      }
      if (removed.length) {
        await supabase
          .from("task_label_map")
          .delete()
          .eq("task_id", id)
          .in("label_id", removed);
        for (const lid of removed) {
          const lbl = data.labels.find((l) => l.id === lid);
          await logActivity(id, me?.id ?? null, "label_removed", { old_value: lbl?.name ?? lid });
        }
      }
    } else {
      payload.created_by = me?.id ?? null;
      if (form.status === "done") {
        payload.completed_at = new Date().toISOString();
        payload.completed_by = me?.id ?? null;
      }
      const { data: inserted, error } = await supabase
        .from("tasks")
        .insert(payload)
        .select()
        .single();
      if (error || !inserted) { alert(`Failed: ${error?.message ?? "no row"}`); return; }
      await logActivity(inserted.id, me?.id ?? null, "created", { new_value: form.title });
      if (form.label_ids.length) {
        await supabase
          .from("task_label_map")
          .insert(form.label_ids.map((label_id) => ({ task_id: inserted.id, label_id })));
        for (const lid of form.label_ids) {
          const lbl = data.labels.find((l) => l.id === lid);
          await logActivity(inserted.id, me?.id ?? null, "label_added", { new_value: lbl?.name ?? lid });
        }
      }
    }

    await data.reload();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) { alert(`Failed: ${error.message}`); return; }
    await data.reload();
  };

  const handleAddComment = async (id: string, comment: string) => {
    const me = await getCurrentAppUser();
    await logActivity(id, me?.id ?? null, "commented", { comment });
  };

  if (data.loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600" />
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load: {data.error}
      </div>
    );
  }

  if (tab === "labels") {
    return <LabelManagerComp labels={data.labels} onChanged={data.reload} />;
  }
  if (tab === "projects") {
    return <ProjectManagerComp projects={data.projects} onChanged={data.reload} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <div className="mt-1">
            <TaskStatsBar tasks={data.tasks} />
          </div>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700"
        >
          + New Task
        </button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        projects={data.projects}
        labels={data.labels}
        users={data.users}
      />

      <TasksTable
        tasks={filtered}
        onSelect={openTask}
        onInlineUpdate={handleInlineUpdate}
      />

      <TaskDetailDrawer
        task={drawerTask}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddComment={async (id, c) => { await handleAddComment(id, c); }}
        projects={data.projects}
        labels={data.labels}
        users={data.users}
      />
    </div>
  );
}
