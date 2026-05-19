-- Revoke admin accounts that were previously seeded in repository history.
-- Replacement admin credentials must be created out-of-band after this migration.

DO $$
DECLARE
  leaked_credential_ids uuid[] := '{}';
  leaked_user_ids uuid[] := '{}';
BEGIN
  SELECT COALESCE(array_agg(id), '{}')
  INTO leaked_credential_ids
  FROM public.admin_credentials
  WHERE username IN (
    'Rv8xQm3kWnZ7',
    'Jt5yHp7bLsX2',
    'Nc4wFd9gAeR5'
  );

  SELECT COALESCE(array_agg(supabase_user_id), '{}')
  INTO leaked_user_ids
  FROM public.admin_credentials
  WHERE id = ANY(leaked_credential_ids)
    AND supabase_user_id IS NOT NULL;

  DELETE FROM public.admin_sessions
  WHERE credential_id = ANY(leaked_credential_ids);

  UPDATE public.admin_login_requests
  SET status = 'denied', resolved_at = now()
  WHERE credential_id = ANY(leaked_credential_ids)
    AND status = 'pending';

  DELETE FROM public.user_roles
  WHERE user_id = ANY(leaked_user_ids);

  DELETE FROM public.admin_credentials
  WHERE id = ANY(leaked_credential_ids);

  DELETE FROM auth.users
  WHERE id = ANY(leaked_user_ids);
END $$;
