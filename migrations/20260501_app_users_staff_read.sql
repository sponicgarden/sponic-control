-- Allow staff to read all app_users rows (needed for assignee dropdowns, etc).
-- The naive policy `EXISTS (SELECT 1 FROM app_users WHERE auth_id = auth.uid() AND role IN (...))`
-- causes infinite recursion: evaluating the policy on app_users requires a SELECT on app_users,
-- which re-applies the same policy. Use a SECURITY DEFINER helper to bypass RLS in the lookup.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.app_users WHERE auth_id = auth.uid() LIMIT 1
$$;

DROP POLICY IF EXISTS app_users_staff_read ON public.app_users;

CREATE POLICY app_users_staff_read ON public.app_users
FOR SELECT USING (
  public.current_user_role() IN ('admin','oracle','staff')
);
