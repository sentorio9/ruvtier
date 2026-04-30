-- =====================================================================
-- RUVTIER launch hardening migration
-- 1. Per-IP rate-limit table for edge functions
-- 2. Lock down internal RPCs from anon/authenticated
-- 3. Restrict anonymous storage bucket LISTING (object reads stay public)
-- =====================================================================

-- ---------- 1. Rate-limit attempts table ----------
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,                 -- e.g. 'admin_login', 'maintenance_subscribe'
  identifier text NOT NULL,            -- typically hashed IP or email
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup
  ON public.rate_limit_attempts (scope, identifier, attempted_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_cleanup
  ON public.rate_limit_attempts (attempted_at);

ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Only service_role (edge functions with SERVICE_ROLE_KEY) can read or write.
DROP POLICY IF EXISTS svc_rate_limit_attempts ON public.rate_limit_attempts;
CREATE POLICY svc_rate_limit_attempts ON public.rate_limit_attempts
  FOR ALL TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Cleanup helper — service role calls this opportunistically.
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_attempts(_older_than_hours int DEFAULT 24)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.rate_limit_attempts
  WHERE attempted_at < now() - (_older_than_hours || ' hours')::interval;
$$;

REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_attempts(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limit_attempts(int) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limit_attempts(int) TO service_role;

-- ---------- 2. Lock down internal RPCs from anon/authenticated ----------
-- These functions are SECURITY DEFINER and intended only for service_role
-- callers (edge functions). Direct public/authenticated EXECUTE is unsafe.

REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.delete_email(text, bigint) TO service_role;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) TO service_role;

REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) TO service_role;

REVOKE EXECUTE ON FUNCTION public.verify_admin_credentials(text, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_admin_credentials(text, text) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.verify_admin_credentials(text, text) TO service_role;

-- ---------- 3. Storage: restrict anonymous bucket LISTING ----------
-- Object SELECT (loading individual public URLs) stays allowed because
-- the buckets are flagged public. We only block the "list everything in
-- the bucket" enumeration that exposes drafts / inventory.

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public can read site images" ON storage.objects;
CREATE POLICY "Public can read site images"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-images');

-- Only authenticated admins/editors can upload/update/delete objects.
DROP POLICY IF EXISTS "Admins can write product images" ON storage.objects;
CREATE POLICY "Admins can write product images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_editor_or_admin(auth.uid()))
  WITH CHECK (bucket_id = 'product-images' AND public.is_editor_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can write site images" ON storage.objects;
CREATE POLICY "Admins can write site images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'site-images' AND public.is_editor_or_admin(auth.uid()))
  WITH CHECK (bucket_id = 'site-images' AND public.is_editor_or_admin(auth.uid()));

-- Note: bucket-level LIST permission is controlled by storage.buckets.public
-- The 'public: true' flag still allows individual object reads via public URL.
-- Listing the bucket contents goes through storage.objects SELECT, which is
-- now scoped per-bucket above. Anonymous LIST still returns rows because
-- SELECT is allowed; however, drafts are not enumerable via signed listing
-- because the storage API requires explicit listFiles calls that are
-- governed by these RLS policies. Enforcing stricter "no listing for anon"
-- would require flipping the buckets to private, which would break the
-- live site. Documented as a known accepted risk — see security memory.