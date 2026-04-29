"use client";

import { useParams } from "next/navigation";
import { TasksClient } from "./tasks-client";
import { LabelManager } from "./label-manager";
import { ProjectManager } from "./project-manager";

export function TasksTabContent() {
  const params = useParams();
  const tab = (params.tab as string) || "list";

  if (tab !== "list" && tab !== "labels" && tab !== "projects") {
    return (
      <div className="rounded-xl border border-slate-200 p-8 text-center text-slate-500">
        <p>Unknown Tasks tab: {tab}</p>
      </div>
    );
  }

  return (
    <TasksClient
      tab={tab}
      LabelManagerComp={LabelManager}
      ProjectManagerComp={ProjectManager}
    />
  );
}
