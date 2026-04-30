"use client";

import { useEffect, useState } from "react";
import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  type AppUserBrief,
  type TaskLabel,
  type TaskProject,
  type TaskStatus,
  type TaskPriority,
  type TaskWithRelations,
} from "@/lib/tasks";
import { TaskActivityLog } from "./task-activity-log";

export interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string | "";
  assignee_id: string | "";
  due_date: string | "";
  label_ids: string[];
}

interface Props {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string | null, form: TaskFormState) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAddComment: (id: string, comment: string) => Promise<void>;
  projects: TaskProject[];
  labels: TaskLabel[];
  users: AppUserBrief[];
}

const EMPTY: TaskFormState = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  project_id: "",
  assignee_id: "",
  due_date: "",
  label_ids: [],
};

export function TaskDetailDrawer({
  task, isOpen, onClose, onSave, onDelete, onAddComment, projects, labels, users,
}: Props) {
  const [form, setForm] = useState<TaskFormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description ?? "",
        status: task.status,
        priority: task.priority,
        project_id: task.project_id ?? "",
        assignee_id: task.assignee_id ?? "",
        due_date: task.due_date ?? "",
        label_ids: task.labels.map((l) => l.id),
      });
    } else {
      setForm(EMPTY);
    }
    setComment("");
  }, [task, isOpen]);

  if (!isOpen) return null;

  const isNew = !task;

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await onSave(task?.id ?? null, form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm("Delete this task? This cannot be undone.")) return;
    setSaving(true);
    try {
      await onDelete(task.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleComment = async () => {
    if (!task || !comment.trim()) return;
    await onAddComment(task.id, comment.trim());
    setComment("");
  };

  const toggleLabel = (id: string) => {
    setForm((f) =>
      f.label_ids.includes(id)
        ? { ...f, label_ids: f.label_ids.filter((x) => x !== id) }
        : { ...f, label_ids: [...f.label_ids, id] }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">
            {isNew ? "New Task" : "Edit Task"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs doing?"
              className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              placeholder="Notes, links, context (markdown ok)…"
              className="w-full px-3 py-2 text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {TASK_PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Project</label>
              <select
                value={form.project_id}
                onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Assignee</label>
              <select
                value={form.assignee_id}
                onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.display_name || u.email || u.id.slice(0, 8)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Due date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="px-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {labels.length === 0 && (
                <span className="text-xs text-slate-400">No labels yet — create one in the Labels tab.</span>
              )}
              {labels.map((l) => {
                const on = form.label_ids.includes(l.id);
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => toggleLabel(l.id)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-opacity ${on ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
                    style={{ backgroundColor: `${l.color}25`, color: l.color }}
                  >
                    {on ? "✓ " : ""}{l.name}
                  </button>
                );
              })}
            </div>
          </div>

          {!isNew && task && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleComment(); } }}
                  placeholder="Add a comment…"
                  className="flex-1 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={handleComment}
                  disabled={!comment.trim()}
                  className="px-3 py-1.5 text-sm text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-40"
                >
                  Post
                </button>
              </div>
              <TaskActivityLog taskId={task.id} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          {!isNew && task ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
            >
              Delete
            </button>
          ) : <span />}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="px-4 py-2 text-sm text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-40"
            >
              {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
