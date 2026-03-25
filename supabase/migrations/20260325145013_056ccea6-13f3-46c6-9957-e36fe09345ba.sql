
CREATE TABLE public.admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  display_label text,
  supabase_email text,
  supabase_password text,
  supabase_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.admin_login_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  remember_me boolean NOT NULL DEFAULT false,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  resolved_at timestamptz
);

CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id uuid NOT NULL REFERENCES public.admin_credentials(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "svc_admin_credentials" ON public.admin_credentials FOR ALL TO public
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "svc_admin_login_requests" ON public.admin_login_requests FOR ALL TO public
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "svc_admin_sessions" ON public.admin_sessions FOR ALL TO public
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.verify_admin_credentials(p_username text, p_password text)
RETURNS TABLE(id uuid, role text, display_label text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT ac.id, ac.role, ac.display_label
  FROM public.admin_credentials ac
  WHERE ac.username = p_username
    AND ac.password_hash = extensions.crypt(p_password, ac.password_hash);
END;
$$;

INSERT INTO public.admin_credentials (username, password_hash, role, display_label) VALUES
('Rv8xQm3kWnZ7', extensions.crypt('Kx9hpLm2wQzT4rVn', extensions.gen_salt('bf', 12)), 'super_admin', 'Operator Alpha'),
('Jt5yHp7bLsX2', extensions.crypt('Hv7nJtF4xBsK2eMq', extensions.gen_salt('bf', 12)), 'super_admin', 'Operator Beta'),
('Nc4wFd9gAeR5', extensions.crypt('Yw3dKcN8gMrP6bXj', extensions.gen_salt('bf', 12)), 'admin', 'Operator Gamma');
