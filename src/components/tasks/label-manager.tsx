"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { TaskLabel } from "@/lib/tasks";

const PRESET_COLORS = [
  "#dc2626", "#ea580c", "#d97706", "#ca8a04",
  "#65a30d", "#16a34a", "#0d9488", "#0891b2",
  "#0284c7", "#2563eb", "#4f46e5", "#7c3aed",
  "#9333ea", "#c026d3", "#db2777", "#6b7280",
];

interface Props {
  labels: TaskLabel[];
  onChanged: () => Promise<void>;
}

export function LabelManager({ labels, onChanged }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("task_labels").insert({ name: name.trim(), color });
    setSaving(false);
    if (error) { alert(`Failed: ${error.message}`); return; }
    setName("");
    await onChanged();
  };

  const startEdit = (l: TaskLabel) => {
    setEditing(l.id);
    setEditName(l.name);
    setEditColor(l.color);
  };

  const saveEdit = async () => {
    if (!editing || !editName.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("task_labels")
      .update({ name: editName.trim(), color: editColor })
      .eq("id", editing);
    setSaving(false);
    if (error) { alert(`Failed: ${error.message}`); return; }
    setEditing(null);
    await onChanged();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this label? It will be removed from all tasks.")) return;
    const { error } = await supabase.from("task_labels").delete().eq("id", id);
    if (error) { alert(`Failed: ${error.message}`); return; }
    await onChanged();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 p-4 bg-white">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">New label</h3>
        <div className="flex gap-2 items-start">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Label name"
            onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm text-white bg-amber-600 rounded-md hover:bg-amber-700 disabled:opacity-40"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-md transition-transform ${color === c ? "ring-2 ring-offset-2 ring-amber-500 scale-110" : ""}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {labels.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-500">No labels yet.</div>
        )}
        {labels.map((l) => (
          <div key={l.id} className="flex items-center gap-3 p-3">
            {editing === l.id ? (
              <>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded"
                />
                <div className="flex gap-1">
                  {PRESET_COLORS.slice(0, 8).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditColor(c)}
                      className={`w-5 h-5 rounded ${editColor === c ? "ring-2 ring-amber-500" : ""}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button onClick={saveEdit} className="text-xs px-2 py-1 bg-amber-600 text-white rounded">Save</button>
                <button onClick={() => setEditing(null)} className="text-xs px-2 py-1 text-slate-500">Cancel</button>
              </>
            ) : (
              <>
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: `${l.color}25`, color: l.color }}
                >
                  {l.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">{l.color}</span>
                <div className="ml-auto flex gap-2">
                  <button onClick={() => startEdit(l)} className="text-xs text-slate-600 hover:text-slate-900">Edit</button>
                  <button onClick={() => handleDelete(l.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
