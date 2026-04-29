"use client";

import { TASK_STATUSES, STATUS_LABELS, type TaskStatus, isOverdue, type TaskWithRelations } from "@/lib/tasks";

export function TaskStatsBar({ tasks }: { tasks: TaskWithRelations[] }) {
  const counts: Record<TaskStatus, number> = {
    backlog: 0, todo: 0, in_progress: 0, review: 0, done: 0,
  };
  let overdue = 0;
  for (const t of tasks) {
    counts[t.status] += 1;
    if (isOverdue(t.due_date, t.status)) overdue += 1;
  }
  const total = tasks.length;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
      <span className="font-medium text-slate-900">{total} total</span>
      {TASK_STATUSES.map((s) => (
        <span key={s} className="flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400" />
          {counts[s]} {STATUS_LABELS[s].toLowerCase()}
        </span>
      ))}
      {overdue > 0 && (
        <span className="text-red-600 font-medium">· {overdue} overdue</span>
      )}
    </div>
  );
}
