export interface MeetingAttendee {
  speakerLabel: string;
  displayName: string;
  appUserId?: string | null;
}

export interface MeetingSegment {
  id: string;
  speakerLabel: string;
  startSeconds: number;
  text: string;
}

export type ActionItemStatus = "proposed" | "accepted" | "dismissed";

export interface MeetingActionItem {
  id: string;
  text: string;
  assigneeLabel?: string | null;
  sourceSegmentId?: string | null;
  status: ActionItemStatus;
  taskId?: string | null;
}

export interface Meeting {
  id: string;
  title: string;
  meetingDate: string;
  durationSeconds?: number | null;
  sourceFormat: "fireflies_md" | "voice_memo" | "manual";
  summary?: string | null;
  attendees: MeetingAttendee[];
  segments: MeetingSegment[];
  actionItems: MeetingActionItem[];
}
