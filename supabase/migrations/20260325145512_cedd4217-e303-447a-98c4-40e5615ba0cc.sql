ALTER TABLE public.admin_sessions
ADD COLUMN last_accessed_at timestamptz DEFAULT now(),
ADD COLUMN last_ip_address text,
ADD COLUMN last_user_agent text,
ADD COLUMN access_count integer DEFAULT 1;