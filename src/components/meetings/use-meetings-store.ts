"use client";

import { useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentAppUser, logActivity } from "@/lib/tasks";
import type { ActionItemStatus, Meeting, MeetingActionItem } from "./types";
import { MOCK_MEETINGS } from "./mock-data";

let meetings: Meeting[] = [...MOCK_MEETINGS];
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return meetings;
}

export function useMeetings() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function addMeeting(m: Meeting) {
  meetings = [m, ...meetings];
  notify();
}

export function setActionItemStatus(
  meetingId: string,
  actionItemId: string,
  status: ActionItemStatus
) {
  meetings = meetings.map((m) =>
    m.id !== meetingId
      ? m
      : {
          ...m,
          actionItems: m.actionItems.map((ai) =>
            ai.id === actionItemId ? { ...ai, status } : ai
          ),
        }
  );
  notify();
}

export function updateMeetingSummary(meetingId: string, summary: string) {
  meetings = meetings.map((m) =>
    m.id === meetingId ? { ...m, summary } : m
  );
  notify();
}

export function setActionItemTaskId(
  meetingId: string,
  actionItemId: string,
  taskId: string
) {
  meetings = meetings.map((m) =>
    m.id !== meetingId
      ? m
      : {
          ...m,
          actionItems: m.actionItems.map((ai) =>
            ai.id === actionItemId ? { ...ai, taskId } : ai
          ),
        }
  );
  notify();
}

/**
 * Insert a row in `public.tasks` from an accepted action item.
 * Returns the new task id, or null on failure (alerts the user).
 * Idempotent: if `ai.taskId` is already set, returns that id without re-inserting.
 */
export async function promoteActionItemToTask(
  meetingId: string,
  meetingTitle: string,
  meetingDate: string,
  ai: MeetingActionItem
): Promise<string | null> {
  if (ai.taskId) return ai.taskId;

  const me = await getCurrentAppUser();
  const dateLabel = new Date(meetingDate).toLocaleDateString();
  const descLines = [
    `From meeting: ${meetingTitle} (${dateLabel})`,
    ai.assigneeLabel ? `Suggested assignee: ${ai.assigneeLabel}` : null,
  ].filter(Boolean);

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: ai.text,
      description: descLines.join("\n"),
      status: "todo",
      priority: "medium",
      created_by: me?.id ?? null,
    })
    .select("id")
    .single();

  if (error || !data) {
    alert(`Failed to create task: ${error?.message ?? "no row returned"}`);
    return null;
  }

  await logActivity(data.id, me?.id ?? null, "created", {
    new_value: ai.text,
    metadata: {
      source: "meeting",
      meeting_id: meetingId,
      action_item_id: ai.id,
    },
  });

  setActionItemTaskId(meetingId, ai.id, data.id);
  return data.id;
}
