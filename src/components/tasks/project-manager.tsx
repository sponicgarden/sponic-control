"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { TaskProject } from "@/lib/tasks";

const PRESET_COLORS = [
  "#dc2626", "#ea580c", "#d97706", "#ca8a04", "#65a30d",
  "#16a34a", "#0d9488", "#0891b2", "#0284c7", "#2563eb",
  "#4f46e5", "#7c3aed", "#9333ea", "#c026d3", "#db2777", "#6b7280",
];

interface Props {
  projects: TaskProject[];
  onChanged: () => Promise<void>;
}

export function ProjectManager({ projects, onChanged }: Props) {
  const [editing, setEditing] = useState<TaskProject | "new" | null>(null);
  const [form, setForm] = useState({ title: "", description: "", color: PRESET_COLORS[5], icon_emoji: "" });
  const [saving, setSaving] = useState(false);

  const startEdit = (p: TaskProject | "new") => {
    setEditing(p);
    if (p === "new") {
      setForm({ title: "", description: "", color: PRESET_COLORS[5], icon_emoji: "" });
    } else {
      setForm({
        title: p.title,
        description: p.description ?? "",
        color: p.color,
        icon_emoji: p.icon_emoji ?? "",
      });
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      color: form.color,
      icon_emoji: form.icon_emoji.trim() || null,
    };
    const { error } =
      editing === "new"
        ? await supabase.from("task_projects").insert(payload)
        : await supabase.from("task_projects").update(payload).eq("id", (editing as TaskProject).id);
    setSaving(false);
    if (error) { alert(`Failed: ${error.message}`); return; }
    setEditing(null);
    await onChanged();
  };

  const handleArchive = async (p: TaskProject) => {
    if (!confirm(`Archive "${p.title}"? Tasks remain but project is hidden.`)) return;
    const { error } = await supabase.from("task_projects").update({ is_archived: true }).eq("id", p.id);
    if (error) { alert(`Failed: ${error.message}`); return; }
    await onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">Group related tasks under a project for filtering.</p>
        {editing === null && (
          <button
            type="button"
            onClick={() => startEdit("new")}
            className="px-3 py-1.5 text-sm text-white bg-amber-600 rounded-md hover:bg-amber-700"
          >
            + New Project
          </button>
        )}
      </div>

      {editing && (
        <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">
            {editing === "new" ? "New project" : `Edit "${(editing as TaskProject).title}"`}
          </h3>
          <div className="grid grid-cols-[1fr_80px] gap-2">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Project title"
              className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="text"
              value={form.icon_emoji}
              onChange={(e) => setForm({ ...form, icon_emoji: e.target.value })}
              placeholder="🌱"
              maxLength={4}
              className="px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 text-center"
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Optional description"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                className={`w-7 h-7 rounded-md ${form.color === c ? "ring-2 ring-offset-2 ring-amber-500 scale-110" : ""}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="px-3 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="px-3 py-1.5 text-sm text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {projects.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-500">No projects yet.</div>
        )}
        {projects.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <span
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-lg"
              style={{ backgroundColor: `${p.color}20`, color: p.color }}
            >
              {p.icon_emoji || "•"}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900">{p.title}</div>
              {p.description && (
                <div className="text-xs text-slate-500 truncate">{p.description}</div>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => startEdit(p)} className="text-xs text-slate-600 hover:text-slate-900">Edit</button>
              <button onClick={() => handleArchive(p)} className="text-xs text-red-600 hover:text-red-700">Archive</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
