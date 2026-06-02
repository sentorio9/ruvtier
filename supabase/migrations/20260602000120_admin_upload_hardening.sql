-- RUVTIER admin rebuild phase 5: storage upload hardening.
--
-- Product images are public storefront assets, but writes are mediated by the
-- admin-upload Edge Function. This bucket configuration keeps storage limits in
-- sync with server-side validation.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
CREATE POLICY "Public can read product images"
ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'product-images');

-- Do not add browser upload/delete policies for this bucket. Admin writes use
-- the service-role-backed admin-upload Edge Function after auth, CSRF, MIME,
-- magic-byte, size, and path validation.
