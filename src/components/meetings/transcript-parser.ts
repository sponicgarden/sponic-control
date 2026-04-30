import type { Meeting, MeetingAttendee, MeetingSegment } from "./types";

const SEGMENT_RE = /^\*\*([^*]+)\*\*\s*\*\[([0-9:]+)\]\*\s*:\s*(.*)$/;

function timestampToSeconds(ts: string): number {
  const parts = ts.split(":").map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export interface ParsedTranscript {
  title?: string;
  attendees: MeetingAttendee[];
  segments: MeetingSegment[];
  durationSeconds: number;
}

export function parseFirefliesMarkdown(raw: string): ParsedTranscript {
  const lines = raw.split(/\r?\n/);
  const speakers = new Map<string, MeetingAttendee>();
  const segments: MeetingSegment[] = [];
  let title: string | undefined;
  let segmentIdx = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (!title && trimmed.startsWith("# ")) {
      title = trimmed.slice(2).trim();
      continue;
    }
    const m = trimmed.match(SEGMENT_RE);
    if (!m) continue;
    const [, speaker, ts, text] = m;
    const speakerLabel = speaker.trim();
    if (!speakers.has(speakerLabel)) {
      speakers.set(speakerLabel, { speakerLabel, displayName: speakerLabel });
    }
    segments.push({
      id: `seg-${segmentIdx++}`,
      speakerLabel,
      startSeconds: timestampToSeconds(ts),
      text: text.trim(),
    });
  }

  const durationSeconds = segments.length
    ? segments[segments.length - 1].startSeconds
    : 0;

  return {
    title,
    attendees: Array.from(speakers.values()),
    segments,
    durationSeconds,
  };
}

export function parsedTranscriptToMeeting(
  parsed: ParsedTranscript,
  overrides: Partial<Pick<Meeting, "id" | "title" | "meetingDate" | "summary" | "actionItems" | "sourceFormat">>
): Meeting {
  return {
    id: overrides.id ?? `meeting-${Date.now()}`,
    title: overrides.title ?? parsed.title ?? "Untitled meeting",
    meetingDate: overrides.meetingDate ?? new Date().toISOString(),
    durationSeconds: parsed.durationSeconds,
    sourceFormat: overrides.sourceFormat ?? "fireflies_md",
    summary: overrides.summary ?? null,
    attendees: parsed.attendees,
    segments: parsed.segments,
    actionItems: overrides.actionItems ?? [],
  };
}
