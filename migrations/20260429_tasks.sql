-- =====================================================
-- Tasks: native task management for the intranet
-- Tables: task_projects, task_labels, tasks, task_label_map, task_activity
-- Applied: 2026-04-29
-- =====================================================

-- ─── task_projects ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  color         TEXT NOT NULL DEFAULT '#2d6a1e',
  icon_emoji    TEXT,
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── task_labels ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_labels (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  color      TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── tasks ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID REFERENCES public.task_projects(id) ON DELETE SET NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'backlog'
                CHECK (status IN ('backlog','todo','in_progress','review','done')),
  priority      TEXT NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('critical','high','medium','low')),
  assignee_id   UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  due_date      DATE,
  display_order INT NOT NULL DEFAULT 0,
  completed_at  TIMESTAMPTZ,
  completed_by  UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_by    UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status   ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date)    WHERE due_date    IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_project  ON public.tasks(project_id)  WHERE project_id  IS NOT NULL;

-- ─── task_label_map ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.task_label_map (
  task_id  UUID NOT NULL REFERENCES public.tasks(id)        ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.task_labels(id)  ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

-- ─── task_activity ──────────────────────────────────────────────────
-- Immutable audit log. action ∈ {created, status_changed, edited, assigned,
-- completed, reopened, label_added, label_removed, commented, deleted}
CREATE TABLE IF NOT EXISTS public.task_activity (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  actor_id   UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
  action     TEXT NOT NULL,
  old_value  TEXT,
  new_value  TEXT,
  comment    TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_activity_task ON public.task_activity(task_id, created_at DESC);

-- ─── updated_at trigger ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.tasks_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.tasks_set_updated_at();

DROP TRIGGER IF EXISTS trg_task_projects_updated_at ON public.task_projects;
CREATE TRIGGER trg_task_projects_updated_at
  BEFORE UPDATE ON public.task_projects
  FOR EACH ROW EXECUTE FUNCTION public.tasks_set_updated_at();

-- =====================================================
-- Row Level Security
-- Pattern: staff/admin/oracle can read; admin/oracle can write.
-- Mirrors 20260311_security_hardening_rls.sql conventions.
-- =====================================================

ALTER TABLE public.task_projects   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_labels     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_label_map  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_activity   ENABLE ROW LEVEL SECURITY;

-- ─── task_projects policies ─────────────────────────────────────────
CREATE POLICY task_projects_staff_read ON public.task_projects
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.app_users
            WHERE auth_user_id = auth.uid()
              AND role IN ('admin','oracle','staff'))
  );

CREATE POLICY task_projects_admin_write ON public.task_projects
  FOR ALL USING (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle')
  ) WITH CHECK (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle')
  );

CREATE POLICY task_projects_service ON public.task_projects
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ─── task_labels policies ───────────────────────────────────────────
CREATE POLICY task_labels_staff_read ON public.task_labels
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.app_users
            WHERE auth_user_id = auth.uid()
              AND role IN ('admin','oracle','staff'))
  );

CREATE POLICY task_labels_admin_write ON public.task_labels
  FOR ALL USING (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle')
  ) WITH CHECK (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle')
  );

CREATE POLICY task_labels_service ON public.task_labels
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ─── tasks policies ─────────────────────────────────────────────────
-- Staff/admin/oracle can read; admin/oracle/staff can also write
-- (tasks are operational — staff need to create and update their own work)
CREATE POLICY tasks_staff_read ON public.tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.app_users
            WHERE auth_user_id = auth.uid()
              AND role IN ('admin','oracle','staff'))
  );

CREATE POLICY tasks_staff_write ON public.tasks
  FOR ALL USING (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle','staff')
  ) WITH CHECK (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle','staff')
  );

CREATE POLICY tasks_service ON public.tasks
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ─── task_label_map policies ────────────────────────────────────────
CREATE POLICY task_label_map_staff_read ON public.task_label_map
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.app_users
            WHERE auth_user_id = auth.uid()
              AND role IN ('admin','oracle','staff'))
  );

CREATE POLICY task_label_map_staff_write ON public.task_label_map
  FOR ALL USING (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle','staff')
  ) WITH CHECK (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle','staff')
  );

CREATE POLICY task_label_map_service ON public.task_label_map
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ─── task_activity policies ─────────────────────────────────────────
-- Staff can read activity; staff can insert (audit trail); no updates/deletes
CREATE POLICY task_activity_staff_read ON public.task_activity
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.app_users
            WHERE auth_user_id = auth.uid()
              AND role IN ('admin','oracle','staff'))
  );

CREATE POLICY task_activity_staff_insert ON public.task_activity
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.app_users WHERE auth_user_id = auth.uid()) IN ('admin','oracle','staff')
  );

CREATE POLICY task_activity_service ON public.task_activity
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- =====================================================
-- Seed default labels
-- =====================================================
INSERT INTO public.task_labels (name, color) VALUES
  ('bug',       '#dc2626'),
  ('feature',   '#2563eb'),
  ('chore',     '#6b7280'),
  ('design',    '#7c3aed'),
  ('docs',      '#0ea5e9'),
  ('blocked',   '#ea580c')
ON CONFLICT (name) DO NOTHING;
