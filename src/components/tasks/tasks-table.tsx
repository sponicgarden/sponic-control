"use client";

import { useMemo, useState } from "react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  TASK_STATUSES,
  TASK_PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_BORDER,
  PRIORITY_BADGE,
  formatDate,
  isOverdue,
  userInitials,
  type TaskStatus,
  type TaskPriority,
  type TaskWithRelations,
} from "@/lib/tasks";

type SortKey = "title" | "status" | "priority" | "due_date" | "updated_at" | "project";

interface Props {
  tasks: TaskWithRelations[];
  onSelect: (task: TaskWithRelations) => void;
  onInlineUpdate: (
    id: string,
    field: "status" | "priority",
    value: TaskStatus | TaskPriority
  ) => void;
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  critical: 0, high: 1, medium: 2, low: 3,
};
const STATUS_RANK: Record<TaskStatus, number> = {
  backlog: 0, todo: 1, in_progress: 2, review: 3, done: 4,
};

export function TasksTable({ tasks, onSelect, onInlineUpdate }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const arr = [...tasks];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "status":
          cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status];
          break;
        case "priority":
          cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
          break;
        case "due_date":
          cmp = (a.due_date || "9999").localeCompare(b.due_date || "9999");
          break;
        case "project":
          cmp = (a.project?.title || "~").localeCompare(b.project?.title || "~");
          break;
        case "updated_at":
        default:
          cmp = a.updated_at.localeCompare(b.updated_at);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [tasks, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      setSortDir(k === "title" || k === "project" ? "asc" : "desc");
    }
  };

  const sortIcon = (k: SortKey) => {
    if (k !== sortKey) return <span className="text-slate-300">↕</span>;
    return <span className="text-amber-600">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 p-12 text-center text-slate-500">
        <p className="text-base">No tasks match your filters.</p>
        <p className="text-sm mt-1">Click <span className="font-medium">+ New Task</span> to create one.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <Th onClick={() => toggleSort("status")} icon={sortIcon("status")} width="w-[140px]">Status</Th>
            <Th onClick={() => toggleSort("priority")} icon={sortIcon("priority")} width="w-[110px]">Priority</Th>
            <Th onClick={() => toggleSort("title")} icon={sortIcon("title")}>Title</Th>
            <Th onClick={() => toggleSort("project")} icon={sortIcon("project")} width="w-[120px]">Project</Th>
            <th className="px-3 py-2 text-left font-medium">Labels</th>
            <th className="px-3 py-2 text-left font-medium w-[80px]">Assignee</th>
            <Th onClick={() => toggleSort("due_date")} icon={sortIcon("due_date")} width="w-[100px]">Due</Th>
            <Th onClick={() => toggleSort("updated_at")} icon={sortIcon("updated_at")} width="w-[100px]">Updated</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((t) => {
            const overdue = isOverdue(t.due_date, t.status);
            return (
              <tr
                key={t.id}
                onClick={() => onSelect(t)}
                className={`hover:bg-amber-50/40 cursor-pointer border-l-4 ${PRIORITY_BORDER[t.priority]} ${
                  t.status === "done" ? "opacity-60" : ""
                }`}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={t.status}
                    onChange={(e) => onInlineUpdate(t.id, "status", e.target.value as TaskStatus)}
                    className={`w-full px-2 py-1 text-xs font-medium rounded border ${STATUS_COLORS[t.status]} cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500`}
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={t.priority}
                    onChange={(e) => onInlineUpdate(t.id, "priority", e.target.value as TaskPriority)}
                    className={`w-full px-2 py-1 text-xs font-medium rounded ${PRIORITY_BADGE[t.priority]} cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500 border-0`}
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div className={`font-medium ${t.status === "done" ? "line-through text-slate-500" : "text-slate-900"}`}>
                    {t.title}
                  </div>
                  {t.description && (
                    <div className="text-xs text-slate-500 line-clamp-1">{t.description}</div>
                  )}
                </td>
                <td className="px-3 py-2">
                  {t.project ? (
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                      style={{ backgroundColor: `${t.project.color}15`, color: t.project.color }}
                    >
                      {t.project.icon_emoji && <span>{t.project.icon_emoji}</span>}
                      <span className="truncate max-w-[100px]">{t.project.title}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {t.labels.slice(0, 3).map((l) => (
                      <span
                        key={l.id}
                        className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ backgroundColor: `${l.color}20`, color: l.color }}
                      >
                        {l.name}
                      </span>
                    ))}
                    {t.labels.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{t.labels.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {t.assignee ? (
                    <div
                      className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px] font-medium"
                      title={t.assignee.display_name || t.assignee.email || ""}
                    >
                      {userInitials(t.assignee)}
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px]">—</div>
                  )}
                </td>
                <td className={`px-3 py-2 text-xs ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                  {formatDate(t.due_date)}
                </td>
                <td className="px-3 py-2 text-xs text-slate-500">
                  {formatDate(t.updated_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({
  children, onClick, icon, width,
}: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode; width?: string }) {
  return (
    <th className={`px-3 py-2 text-left font-medium ${width || ""}`}>
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1 hover:text-slate-900"
      >
        {children} {icon}
      </button>
    </th>
  );
}
