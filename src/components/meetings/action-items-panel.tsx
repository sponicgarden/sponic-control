"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ActionItemStatus } from "./types";
import {
  promoteActionItemToTask,
  setActionItemStatus,
  useMeetings,
} from "./use-meetings-store";

const TABS: { key: "open" | "accepted" | "dismissed" | "all"; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "accepted", label: "Accepted" },
  { key: "dismissed", label: "Dismissed" },
  { key: "all", label: "All" },
];

export function ActionItemsPanel() {
  const meetings = useMeetings();
  const [filter, setFilter] = useState<typeof TABS[number]["key"]>("open");
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const params = useParams();
  const lang = (params.lang as string) || "en";

  const rows = useMemo(() => {
    const flat: {
      meetingId: string;
      meetingTitle: string;
      meetingDate: string;
      itemId: string;
      text: string;
      assigneeLabel: string | null | undefined;
      status: ActionItemStatus;
      taskId: string | null | undefined;
    }[] = [];
    for (const m of meetings) {
      for (const ai of m.actionItems) {
        flat.push({
          meetingId: m.id,
          meetingTitle: m.title,
          meetingDate: m.meetingDate,
          itemId: ai.id,
          text: ai.text,
          assigneeLabel: ai.assigneeLabel,
          status: ai.status,
          taskId: ai.taskId,
        });
      }
    }
    if (filter === "all") return flat;
    if (filter === "open") return flat.filter((r) => r.status === "proposed");
    return flat.filter((r) => r.status === filter);
  }, [meetings, filter]);

  const handleStatusClick = async (
    row: typeof rows[number],
    status: ActionItemStatus
  ) => {
    if (status === "accepted" && !row.taskId) {
      const meeting = meetings.find((m) => m.id === row.meetingId);
      const ai = meeting?.actionItems.find((a) => a.id === row.itemId);
      if (!meeting || !ai) return;
      setPromotingId(row.itemId);
      const taskId = await promoteActionItemToTask(
        meeting.id,
        meeting.title,
        meeting.meetingDate,
        ai
      );
      setPromotingId(null);
      if (!taskId) return;
    }
    setActionItemStatus(row.meetingId, row.itemId, status);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Action items</h1>
        <p className="mt-1 text-sm text-slate-500">
          Items extracted across every meeting. Accept to promote to a task.
        </p>
      </div>

      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setFilter(t.key)}
            className={`px-3 py-2 text-sm font-medium ${
              filter === t.key
                ? "text-amber-700 border-b-2 border-amber-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Item</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Assignee</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Meeting</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((r) => (
              <tr key={`${r.meetingId}-${r.itemId}`}>
                <td className="px-4 py-3 text-sm text-slate-800">{r.text}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{r.assigneeLabel ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  <div>{r.meetingTitle}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(r.meetingDate).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-1">
                    {(["proposed", "accepted", "dismissed"] as const).map((s) => {
                      const busy = promotingId === r.itemId && s === "accepted";
                      return (
                        <button
                          key={s}
                          type="button"
                          disabled={busy}
                          onClick={() => handleStatusClick(r, s)}
                          className={`px-2 py-0.5 text-xs rounded capitalize ${
                            r.status === s
                              ? "bg-slate-800 text-white"
                              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                          } disabled:opacity-50 disabled:cursor-wait`}
                        >
                          {busy ? "…" : s}
                        </button>
                      );
                    })}
                    {r.taskId && (
                      <Link
                        href={`/${lang}/intranet/tasks/list`}
                        className="ml-2 text-xs font-medium text-emerald-700 hover:text-emerald-900"
                      >
                        ✓ task
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">
                  Nothing here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
