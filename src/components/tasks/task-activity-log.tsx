"use client";

import { useTaskActivity } from "@/hooks/use-tasks";
import { timeAgo, userInitials, type TaskActivityEntry } from "@/lib/tasks";

const ACTION_VERB: Record<string, string> = {
  created: "created the task",
  status_changed: "changed status",
  edited: "edited",
  assigned: "set assignee",
  completed: "marked done",
  reopened: "reopened",
  label_added: "added label",
  label_removed: "removed label",
  commented: "commented",
  deleted: "deleted",
};

export function TaskActivityLog({ taskId }: { taskId: string }) {
  const { entries, loading } = useTaskActivity(taskId);

  if (loading) {
    return <div className="text-xs text-slate-400">Loading activity…</div>;
  }

  if (entries.length === 0) {
    return <div className="text-xs text-slate-400">No activity yet.</div>;
  }

  return (
    <div className="space-y-3">
      {entries.map((e) => (
        <ActivityRow key={e.id} entry={e} />
      ))}
    </div>
  );
}

function ActivityRow({ entry }: { entry: TaskActivityEntry }) {
  const verb = ACTION_VERB[entry.action] || entry.action.replace(/_/g, " ");
  const actorName =
    entry.actor?.display_name || entry.actor?.email || "Someone";

  return (
    <div className="flex gap-2 text-xs">
      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-medium flex-shrink-0">
        {userInitials(entry.actor ?? null)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-slate-700">
          <span className="font-medium">{actorName}</span>{" "}
          <span className="text-slate-500">{verb}</span>
          {(entry.old_value || entry.new_value) && entry.action !== "commented" && (
            <span className="text-slate-500">
              {" "}
              {entry.old_value && <span className="line-through">{entry.old_value}</span>}
              {entry.old_value && entry.new_value && " → "}
              {entry.new_value && <span className="font-medium text-slate-700">{entry.new_value}</span>}
            </span>
          )}
        </div>
        {entry.comment && (
          <div className="mt-0.5 px-2 py-1 bg-slate-50 rounded text-slate-700 whitespace-pre-wrap">
            {entry.comment}
          </div>
        )}
        <div className="text-slate-400 text-[10px] mt-0.5">{timeAgo(entry.created_at)}</div>
      </div>
    </div>
  );
}
