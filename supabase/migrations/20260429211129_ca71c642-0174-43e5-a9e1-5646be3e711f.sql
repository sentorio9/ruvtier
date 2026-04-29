-- Allow editors (in addition to admins) to upload/update/delete product and site images
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update site images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete site images" ON storage.objects;

CREATE POLICY "Staff can upload product images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Staff can update product images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_editor_or_admin(auth.uid()))
  WITH CHECK (bucket_id = 'product-images' AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Staff can delete product images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Staff can upload site images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Staff can update site images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_editor_or_admin(auth.uid()))
  WITH CHECK (bucket_id = 'site-images' AND public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Staff can delete site images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_editor_or_admin(auth.uid()));

-- Ensure the site-images bucket is publicly viewable (product-images already is)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public can view site images'
  ) THEN
    CREATE POLICY "Public can view site images"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'site-images');
  END IF;
END $$;