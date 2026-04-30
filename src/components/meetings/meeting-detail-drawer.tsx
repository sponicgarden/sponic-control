"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Meeting, ActionItemStatus, MeetingActionItem } from "./types";
import { formatTimestamp } from "./transcript-parser";
import { promoteActionItemToTask, setActionItemStatus } from "./use-meetings-store";

interface Props {
  meeting: Meeting | null;
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STYLES: Record<ActionItemStatus, string> = {
  proposed: "bg-amber-50 border-amber-200",
  accepted: "bg-emerald-50 border-emerald-200",
  dismissed: "bg-slate-50 border-slate-200 opacity-60",
};

export function MeetingDetailDrawer({ meeting, isOpen, onClose }: Props) {
  const [pane, setPane] = useState<"summary" | "transcript" | "actions">("summary");
  const [promotingId, setPromotingId] = useState<string | null>(null);
  const params = useParams();
  const lang = (params.lang as string) || "en";

  const handleStatusClick = async (
    ai: MeetingActionItem,
    status: ActionItemStatus
  ) => {
    if (!meeting) return;
    if (status === "accepted" && !ai.taskId) {
      setPromotingId(ai.id);
      const taskId = await promoteActionItemToTask(
        meeting.id,
        meeting.title,
        meeting.meetingDate,
        ai
      );
      setPromotingId(null);
      if (!taskId) return;
    }
    setActionItemStatus(meeting.id, ai.id, status);
  };

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{meeting.title}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {new Date(meeting.meetingDate).toLocaleString()} ·{" "}
              {meeting.attendees.map((a) => a.displayName).join(", ")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="border-b border-slate-200 bg-white">
          <div className="flex gap-1 px-6">
            {(["summary", "transcript", "actions"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPane(p)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  pane === p
                    ? "text-amber-700 border-b-2 border-amber-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {p === "actions" ? `Action items (${meeting.actionItems.length})` : p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {pane === "summary" && (
            <div className="space-y-4">
              {meeting.summary ? (
                <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {meeting.summary}
                </p>
              ) : (
                <p className="text-sm italic text-slate-400">
                  No summary yet. (Will be auto-generated when wired to backend.)
                </p>
              )}
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500 mb-2">
                  Speakers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {meeting.attendees.map((a) => (
                    <span
                      key={a.speakerLabel}
                      className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {a.displayName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {pane === "transcript" && (
            <div className="space-y-3">
              {meeting.segments.map((seg) => (
                <div key={seg.id} id={seg.id} className="flex gap-3 text-sm">
                  <div className="w-24 flex-shrink-0 pt-0.5">
                    <div className="font-medium text-slate-700">{seg.speakerLabel}</div>
                    <div className="font-mono text-xs text-slate-400">
                      {formatTimestamp(seg.startSeconds)}
                    </div>
                  </div>
                  <div className="flex-1 leading-relaxed text-slate-700">{seg.text}</div>
                </div>
              ))}
            </div>
          )}

          {pane === "actions" && (
            <div className="space-y-2">
              {meeting.actionItems.length === 0 && (
                <p className="text-sm italic text-slate-400">No action items extracted.</p>
              )}
              {meeting.actionItems.map((ai) => (
                <div
                  key={ai.id}
                  className={`rounded-lg border p-3 ${STATUS_STYLES[ai.status]}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm text-slate-800">{ai.text}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                        {ai.assigneeLabel && <span>→ {ai.assigneeLabel}</span>}
                        {ai.sourceSegmentId && (
                          <a
                            href={`#${ai.sourceSegmentId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setPane("transcript");
                              setTimeout(() => {
                                document.getElementById(ai.sourceSegmentId!)?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "center",
                                });
                              }, 50);
                            }}
                            className="text-amber-700 underline hover:text-amber-900"
                          >
                            view in transcript
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      {(["proposed", "accepted", "dismissed"] as const).map((s) => {
                        const busy = promotingId === ai.id && s === "accepted";
                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={busy}
                            onClick={() => handleStatusClick(ai, s)}
                            className={`px-2 py-0.5 text-xs rounded capitalize ${
                              ai.status === s
                                ? "bg-slate-800 text-white"
                                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                            } disabled:opacity-50 disabled:cursor-wait`}
                          >
                            {busy ? "…" : s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {ai.taskId && (
                    <Link
                      href={`/${lang}/intranet/tasks/list`}
                      className="mt-2 inline-block text-xs font-medium text-emerald-700 hover:text-emerald-900"
                    >
                      ✓ Task created — view in Tasks →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
