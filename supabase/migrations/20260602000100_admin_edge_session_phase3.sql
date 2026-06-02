-- RUVTIER admin rebuild phase 3: secure Edge Function sessions.
--
-- This migration is additive and keeps existing admin credentials intact. New
-- Edge Functions store only token hashes server-side and authenticate admins
-- with httpOnly cookies plus per-session CSRF tokens.

ALTER TABLE public.admin_credentials
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS failed_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until timestamptz,
  ADD COLUMN IF NOT EXISTS supabase_email text,
  ADD COLUMN IF NOT EXISTS supabase_user_id uuid;

ALTER TABLE public.admin_sessions
  ADD COLUMN IF NOT EXISTS session_token_hash text,
  ADD COLUMN IF NOT EXISTS csrf_token_hash text,
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS remember_me boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_ip_hash text,
  ADD COLUMN IF NOT EXISTS last_ip_hash text,
  ADD COLUMN IF NOT EXISTS user_agent_hash text,
  ADD COLUMN IF NOT EXISTS role_snapshot text,
  ADD COLUMN IF NOT EXISTS display_label_snapshot text,
  ADD COLUMN IF NOT EXISTS last_accessed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS access_count integer DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_sessions_token_hash
  ON public.admin_sessions (session_token_hash)
  WHERE session_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_admin_sessions_active_lookup
  ON public.admin_sessions (session_token_hash, expires_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_admin_sessions_credential_active
  ON public.admin_sessions (credential_id, expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE IF NOT EXISTS public.admin_login_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'expired')),
  remember_me boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  resolved_at timestamptz
);

ALTER TABLE public.admin_login_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can manage admin login requests" ON public.admin_login_requests;
CREATE POLICY "Service role can manage admin login requests"
ON public.admin_login_requests
FOR ALL TO public
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_admin_login_requests_status_expires
  ON public.admin_login_requests (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_login_requests_credential
  ON public.admin_login_requests (credential_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.verify_admin_login(p_username text, p_password text)
RETURNS TABLE(
  credential_id uuid,
  role text,
  display_label text,
  supabase_user_id uuid,
  supabase_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_credential record;
BEGIN
  SELECT * INTO v_credential
  FROM public.admin_credentials
  WHERE username = p_username
    AND is_active = true;

  IF v_credential.id IS NULL THEN
    RETURN;
  END IF;

  IF v_credential.locked_until IS NOT NULL AND v_credential.locked_until > now() THEN
    RETURN;
  END IF;

  IF v_credential.password_hash = extensions.crypt(p_password, v_credential.password_hash) THEN
    UPDATE public.admin_credentials
    SET failed_attempts = 0,
        locked_until = NULL,
        last_login_at = now()
    WHERE id = v_credential.id;

    credential_id := v_credential.id;
    role := v_credential.role;
    display_label := v_credential.display_label;
    supabase_user_id := v_credential.supabase_user_id;
    supabase_email := v_credential.supabase_email;
    RETURN NEXT;
  ELSE
    UPDATE public.admin_credentials
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE
          WHEN failed_attempts >= 4 THEN now() + interval '15 minutes'
          ELSE locked_until
        END
    WHERE id = v_credential.id;
  END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.verify_admin_login(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_admin_login(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_login(text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.admin_sessions
  SET revoked_at = COALESCE(revoked_at, now())
  WHERE expires_at < now()
    AND revoked_at IS NULL;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_expired_admin_sessions() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_expired_admin_sessions() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_admin_sessions() TO service_role;
