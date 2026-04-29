import { supabase } from "./supabase";

export const TASK_STATUSES = ["backlog", "todo", "in_progress", "review", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "bg-slate-100 text-slate-700 border-slate-200",
  todo: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  review: "bg-purple-50 text-purple-700 border-purple-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export const PRIORITY_BORDER: Record<TaskPriority, string> = {
  critical: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-blue-400",
  low: "border-l-slate-300",
};

export const PRIORITY_BADGE: Record<TaskPriority, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-blue-100 text-blue-700",
  low: "bg-slate-100 text-slate-600",
};

export interface TaskProject {
  id: string;
  title: string;
  description: string | null;
  color: string;
  icon_emoji: string | null;
  is_archived: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  display_order: number;
  completed_at: string | null;
  completed_by: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskWithRelations extends Task {
  project?: TaskProject | null;
  assignee?: AppUserBrief | null;
  labels: TaskLabel[];
}

export interface AppUserBrief {
  id: string;
  email: string | null;
  display_name: string | null;
  role: string | null;
}

export interface TaskActivityEntry {
  id: string;
  task_id: string;
  actor_id: string | null;
  action: string;
  old_value: string | null;
  new_value: string | null;
  comment: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor?: AppUserBrief | null;
}

export async function getCurrentAppUser(): Promise<AppUserBrief | null> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData?.user) return null;
  const { data, error } = await supabase
    .from("app_users")
    .select("id, email, display_name, role")
    .eq("auth_id", authData.user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as AppUserBrief;
}

export async function logActivity(
  taskId: string,
  actorId: string | null,
  action: string,
  fields: Partial<Pick<TaskActivityEntry, "old_value" | "new_value" | "comment" | "metadata">> = {}
) {
  await supabase.from("task_activity").insert({
    task_id: taskId,
    actor_id: actorId,
    action,
    old_value: fields.old_value ?? null,
    new_value: fields.new_value ?? null,
    comment: fields.comment ?? null,
    metadata: fields.metadata ?? {},
  });
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function isOverdue(dueDate: string | null, status: TaskStatus): boolean {
  if (!dueDate || status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export function userInitials(u: AppUserBrief | null | undefined): string {
  if (!u) return "—";
  const name = u.display_name || u.email || "";
  if (!name) return "?";
  const parts = name.split(/[\s@.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
