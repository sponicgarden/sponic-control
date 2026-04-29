"use client";

import {
  TASK_STATUSES,
  TASK_PRIORITIES,
  STATUS_LABELS,
  PRIORITY_LABELS,
  type TaskStatus,
  type TaskPriority,
  type AppUserBrief,
  type TaskLabel,
  type TaskProject,
} from "@/lib/tasks";

export interface TaskFiltersState {
  search: string;
  projectId: string | "all";
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  assigneeId: string | "all" | "unassigned";
  labelId: string | "all";
  showDone: boolean;
}

export const DEFAULT_FILTERS: TaskFiltersState = {
  search: "",
  projectId: "all",
  status: "all",
  priority: "all",
  assigneeId: "all",
  labelId: "all",
  showDone: false,
};

interface Props {
  filters: TaskFiltersState;
  onChange: (next: TaskFiltersState) => void;
  projects: TaskProject[];
  labels: TaskLabel[];
  users: AppUserBrief[];
}

export function TaskFilters({ filters, onChange, projects, labels, users }: Props) {
  const update = <K extends keyof TaskFiltersState>(k: K, v: TaskFiltersState[K]) =>
    onChange({ ...filters, [k]: v });

  const clear = () => onChange(DEFAULT_FILTERS);
  const isClean =
    filters.search === DEFAULT_FILTERS.search &&
    filters.projectId === "all" &&
    filters.status === "all" &&
    filters.priority === "all" &&
    filters.assigneeId === "all" &&
    filters.labelId === "all" &&
    !filters.showDone;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <input
        type="text"
        placeholder="Search tasks…"
        value={filters.search}
        onChange={(e) => update("search", e.target.value)}
        className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />
      <select
        value={filters.projectId}
        onChange={(e) => update("projectId", e.target.value as TaskFiltersState["projectId"])}
        className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="all">All projects</option>
        <option value="">No project</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.title}</option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) => update("status", e.target.value as TaskFiltersState["status"])}
        className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="all">All status</option>
        {TASK_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>
      <select
        value={filters.priority}
        onChange={(e) => update("priority", e.target.value as TaskFiltersState["priority"])}
        className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="all">All priority</option>
        {TASK_PRIORITIES.map((p) => (
          <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
        ))}
      </select>
      <select
        value={filters.assigneeId}
        onChange={(e) => update("assigneeId", e.target.value as TaskFiltersState["assigneeId"])}
        className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="all">All assignees</option>
        <option value="unassigned">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>{u.display_name || u.email || u.id.slice(0, 8)}</option>
        ))}
      </select>
      <select
        value={filters.labelId}
        onChange={(e) => update("labelId", e.target.value as TaskFiltersState["labelId"])}
        className="px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
      >
        <option value="all">All labels</option>
        {labels.map((l) => (
          <option key={l.id} value={l.id}>{l.name}</option>
        ))}
      </select>
      <label className="flex items-center gap-1.5 text-sm text-slate-600 select-none">
        <input
          type="checkbox"
          checked={filters.showDone}
          onChange={(e) => update("showDone", e.target.checked)}
          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
        Show done
      </label>
      {!isClean && (
        <button
          type="button"
          onClick={clear}
          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
        >
          Clear
        </button>
      )}
    </div>
  );
}
