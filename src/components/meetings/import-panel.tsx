"use client";

import { useState } from "react";
import { addMeeting } from "./use-meetings-store";
import { parseFirefliesMarkdown, parsedTranscriptToMeeting } from "./transcript-parser";

export function ImportPanel() {
  const [raw, setRaw] = useState("");
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState(() =>
    new Date().toISOString().slice(0, 16)
  );
  const [imported, setImported] = useState<string | null>(null);

  const handleImport = () => {
    if (!raw.trim()) return;
    const parsed = parseFirefliesMarkdown(raw);
    if (parsed.segments.length === 0) {
      alert("No segments parsed — check the format. Expected: **Speaker** *[mm:ss]*: text");
      return;
    }
    const meeting = parsedTranscriptToMeeting(parsed, {
      title: title.trim() || parsed.title || "Imported meeting",
      meetingDate: new Date(meetingDate).toISOString(),
      sourceFormat: "fireflies_md",
    });
    addMeeting(meeting);
    setImported(meeting.id);
    setRaw("");
    setTitle("");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Import transcript</h1>
        <p className="mt-1 text-sm text-slate-500">
          Paste a Fireflies markdown export. We&apos;ll parse out speakers, timestamps,
          and segments. (Summary + action-item extraction will hook up once the
          backend lands.)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Title (optional — falls back to first heading)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sonia x Rahul — investor strategy"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Meeting date/time
          </label>
          <input
            type="datetime-local"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Markdown transcript
        </label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={16}
          placeholder={`# Title\n\n**Speaker A** *[00:00]*: ...\n**Speaker B** *[00:15]*: ...`}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleImport}
          disabled={!raw.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Import
        </button>
        {imported && (
          <span className="text-sm text-emerald-700">
            Imported. Open the Meetings tab to see it.
          </span>
        )}
      </div>
    </div>
  );
}
