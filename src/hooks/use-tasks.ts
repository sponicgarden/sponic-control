"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  type AppUserBrief,
  type Task,
  type TaskActivityEntry,
  type TaskLabel,
  type TaskProject,
  type TaskWithRelations,
} from "@/lib/tasks";

interface TasksData {
  tasks: TaskWithRelations[];
  projects: TaskProject[];
  labels: TaskLabel[];
  users: AppUserBrief[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

async function fetchTasksData() {
  const [tasksRes, projectsRes, labelsRes, mapRes, usersRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("task_projects")
      .select("*")
      .eq("is_archived", false)
      .order("display_order", { ascending: true }),
    supabase.from("task_labels").select("*").order("name", { ascending: true }),
    supabase.from("task_label_map").select("task_id, label_id"),
    supabase
      .from("app_users")
      .select("id, email, display_name, role")
      .order("display_name", { ascending: true }),
  ]);

  if (tasksRes.error) throw tasksRes.error;
  if (projectsRes.error) throw projectsRes.error;
  if (labelsRes.error) throw labelsRes.error;
  if (mapRes.error) throw mapRes.error;
  if (usersRes.error) throw usersRes.error;

  const projectsList = (projectsRes.data ?? []) as TaskProject[];
  const labelsList = (labelsRes.data ?? []) as TaskLabel[];
  const usersList = (usersRes.data ?? []) as AppUserBrief[];
  const projectsById = new Map(projectsList.map((p) => [p.id, p]));
  const usersById = new Map(usersList.map((u) => [u.id, u]));
  const labelsById = new Map(labelsList.map((l) => [l.id, l]));
  const labelsByTask = new Map<string, TaskLabel[]>();
  for (const row of (mapRes.data ?? []) as { task_id: string; label_id: string }[]) {
    const lbl = labelsById.get(row.label_id);
    if (!lbl) continue;
    const list = labelsByTask.get(row.task_id) ?? [];
    list.push(lbl);
    labelsByTask.set(row.task_id, list);
  }

  const enriched: TaskWithRelations[] = ((tasksRes.data ?? []) as Task[]).map((t) => ({
    ...t,
    project: t.project_id ? projectsById.get(t.project_id) ?? null : null,
    assignee: t.assignee_id ? usersById.get(t.assignee_id) ?? null : null,
    labels: labelsByTask.get(t.id) ?? [],
  }));

  return { tasks: enriched, projects: projectsList, labels: labelsList, users: usersList };
}

export function useTasksData(): TasksData {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [projects, setProjects] = useState<TaskProject[]>([]);
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [users, setUsers] = useState<AppUserBrief[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  const reload = useCallback(async () => {
    setReloadCount((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const out = await fetchTasksData();
        if (cancelled) return;
        setTasks(out.tasks);
        setProjects(out.projects);
        setLabels(out.labels);
        setUsers(out.users);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "Failed to load tasks";
        setError(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [reloadCount]);

  return { tasks, projects, labels, users, loading, error, reload };
}

export function useTaskActivity(taskId: string | null) {
  const [entries, setEntries] = useState<TaskActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const reload = useCallback(async () => {
    setReloadCount((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!taskId) {
        if (!cancelled) setEntries([]);
        return;
      }
      if (!cancelled) setLoading(true);
      const [activityRes, usersRes] = await Promise.all([
        supabase
          .from("task_activity")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false }),
        supabase.from("app_users").select("id, email, display_name, role"),
      ]);
      if (cancelled) return;
      setLoading(false);
      if (activityRes.error) {
        setEntries([]);
        return;
      }
      const usersById = new Map(
        ((usersRes.data ?? []) as AppUserBrief[]).map((u) => [u.id, u])
      );
      setEntries(
        ((activityRes.data ?? []) as TaskActivityEntry[]).map((e) => ({
          ...e,
          actor: e.actor_id ? usersById.get(e.actor_id) ?? null : null,
        }))
      );
    }
    run();
    return () => { cancelled = true; };
  }, [taskId, reloadCount]);

  return { entries, loading, reload };
}
