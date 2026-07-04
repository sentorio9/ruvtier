
-- 1) Lock down SECURITY DEFINER functions: revoke EXECUTE from PUBLIC/anon/authenticated by default,
--    then re-grant only to the roles that must call them.

-- Backend-only helpers (edge functions use service_role)
REVOKE ALL ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.verify_admin_credentials(text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_rate_limit_attempts(integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_dispatch() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;
GRANT EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_admin_credentials(text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_attempts(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_queue_dispatch() TO service_role;

-- Trigger functions: no client role needs EXECUTE (triggers fire as table owner)
REVOKE ALL ON FUNCTION public.sync_preorder_to_customer() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.email_queue_wake() FROM PUBLIC, anon, authenticated;

-- RLS helper functions must remain executable by roles that hit RLS-protected tables.
-- Revoke from PUBLIC/anon then grant only to authenticated (+ service_role for edge admin code).
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_editor_or_admin(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) TO authenticated, service_role;

-- 2) Orders: defense-in-depth — restrict DELETE to super_admin only.
--    The permissive "Admins can manage orders" (is_admin) still governs SELECT/INSERT/UPDATE;
--    this restrictive policy narrows destructive deletes to super_admin, closing the review.
CREATE POLICY "Restrict order deletes to super admins"
  ON public.orders
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- 3) user_roles: align restrictive policy role list with the permissive policy ({authenticated})
--    to remove the anon/authenticated mismatch flagged by the reviewer. Anon can never satisfy
--    auth.uid() = super_admin anyway, and there is no permissive policy granting anon writes.
DROP POLICY IF EXISTS "Restrict role writes to super admins" ON public.user_roles;
CREATE POLICY "Restrict role writes to super admins"
  ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Additionally, explicitly deny any anon write to user_roles as belt-and-braces.
CREATE POLICY "Deny anon writes to user_roles"
  ON public.user_roles
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
