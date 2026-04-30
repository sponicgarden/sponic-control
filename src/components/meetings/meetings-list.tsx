"use client";

import { useState } from "react";
import { useMeetings } from "./use-meetings-store";
import { MeetingDetailDrawer } from "./meeting-detail-drawer";
import { formatTimestamp } from "./transcript-parser";
import type { Meeting } from "./types";

function formatMeetingDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MeetingsList() {
  const meetings = useMeetings();
  const [selected, setSelected] = useState<Meeting | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meetings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Transcripts, summaries, and action items from team conversations.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Date</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Length</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Attendees</th>
              <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Action items</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {meetings.map((m) => {
              const openCount = m.actionItems.filter((ai) => ai.status === "proposed").length;
              return (
                <tr
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className="cursor-pointer hover:bg-amber-50/50"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{m.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{formatMeetingDate(m.meetingDate)}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {m.durationSeconds ? formatTimestamp(m.durationSeconds) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {m.attendees.map((a) => a.displayName).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {openCount > 0 ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {openCount} open
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {meetings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-400">
                  No meetings yet. Use the Import tab to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <MeetingDetailDrawer
        meeting={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
