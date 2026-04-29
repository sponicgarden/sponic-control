"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export function PlanlistTab() {
  const params = useParams();
  const lang = (params.lang as string) || "en";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">PlanList</h1>
        <p className="text-sm text-slate-500">
          Implementation plans, remediation checklists, and project roadmaps
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-base font-semibold text-amber-900 mb-1">
          Moved to a dedicated section
        </h2>
        <p className="text-sm text-amber-800 mb-3">
          Task management now lives at a top-level <strong>Tasks</strong> section in the intranet,
          with a sortable list view, projects, labels, and per-task activity history.
        </p>
        <Link
          href={`/${lang}/intranet/tasks/list`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-amber-700 rounded-md hover:bg-amber-800"
        >
          Open Tasks →
        </Link>
      </div>
    </div>
  );
}
