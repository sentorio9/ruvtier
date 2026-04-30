-- =====================================================================
-- Final lockdown of remaining SECURITY DEFINER helpers
-- These are used internally by RLS policies / triggers — no callers
-- ever invoke them via the REST/RPC surface.
-- =====================================================================

REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.is_admin(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.is_editor_or_admin(uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.sync_preorder_to_customer() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_preorder_to_customer() FROM anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;

-- =====================================================================
-- Storage: prevent anonymous BUCKET LISTING while keeping object reads
-- We restrict SELECT to specific name prefixes + admin-only listing.
-- Public URLs (which do not go through SELECT enumeration) still work.
-- =====================================================================

-- Drop the broad anon SELECT policies and replace with admin-only listing,
-- combined with a narrow public read policy that still lets the site fetch
-- objects by direct path. Public URL fetches succeed via the storage CDN
-- without an RLS check; only API-driven LIST/SELECT calls hit RLS.

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read site images" ON storage.objects;

-- Admins/editors can list and read everything in image buckets.
DROP POLICY IF EXISTS "Admins can list product images" ON storage.objects;
CREATE POLICY "Admins can list product images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_editor_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can list site images" ON storage.objects;
CREATE POLICY "Admins can list site images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'site-images' AND public.is_editor_or_admin(auth.uid()));

-- NOTE: With buckets flagged public=true, individual object URLs continue
-- to load via the storage CDN without an RLS check. We deliberately do
-- NOT create an anon SELECT policy on storage.objects, which prevents
-- enumeration via list() while keeping public asset URLs functional.