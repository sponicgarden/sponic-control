"use client";

import { useParams } from "next/navigation";
import { MeetingsList } from "./meetings-list";
import { ActionItemsPanel } from "./action-items-panel";
import { ImportPanel } from "./import-panel";

export function MeetingsTabContent() {
  const params = useParams();
  const tab = (params.tab as string) || "list";

  if (tab === "list") return <MeetingsList />;
  if (tab === "action-items") return <ActionItemsPanel />;
  if (tab === "import") return <ImportPanel />;

  return (
    <div className="rounded-xl border border-slate-200 p-8 text-center text-slate-500">
      <p>Unknown Meetings tab: {tab}</p>
    </div>
  );
}
