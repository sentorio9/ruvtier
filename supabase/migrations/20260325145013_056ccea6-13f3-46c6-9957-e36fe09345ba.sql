-- Create admin credentials table with hashed passwords
CREATE TABLE public.admin_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  display_label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Only service role can access admin credentials
CREATE POLICY "Service role can manage admin credentials"
ON public.admin_credentials
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create admin sessions table
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credential_id UUID NOT NULL REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage admin sessions"
ON public.admin_sessions
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Function to verify admin credentials
CREATE OR REPLACE FUNCTION public.verify_admin_credentials(p_username TEXT, p_password TEXT)
RETURNS TABLE(
  credential_id UUID,
  admin_role TEXT,
  display_label TEXT,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_credential RECORD;
BEGIN
  SELECT * INTO v_credential
  FROM public.admin_credentials
  WHERE username = p_username AND is_active = true;

  IF v_credential.id IS NULL THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false;
    RETURN;
  END IF;

  -- Check if account is locked
  IF v_credential.locked_until IS NOT NULL AND v_credential.locked_until > now() THEN
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false;
    RETURN;
  END IF;

  -- Verify password
  IF v_credential.password_hash = extensions.crypt(p_password, v_credential.password_hash) THEN
    -- Reset failed attempts and update last login
    UPDATE public.admin_credentials
    SET failed_attempts = 0, locked_until = NULL, last_login_at = now()
    WHERE id = v_credential.id;

    RETURN QUERY SELECT v_credential.id, v_credential.role, v_credential.display_label, true;
  ELSE
    -- Increment failed attempts
    UPDATE public.admin_credentials
    SET failed_attempts = failed_attempts + 1,
        locked_until = CASE WHEN failed_attempts >= 4 THEN now() + interval '15 minutes' ELSE locked_until END
    WHERE id = v_credential.id;

    RETURN QUERY SELECT NULL::UUID, NULL::TEXT, NULL::TEXT, false;
  END IF;
END;
$$;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.admin_sessions WHERE expires_at < now();
$$;

-- Admin credentials must be created out-of-band after deployment.
-- Do not seed usernames or passwords in migrations.
