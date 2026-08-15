DROP POLICY IF EXISTS "Staff can read product originals" ON storage.objects;
CREATE POLICY "Staff can read product originals"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'product-originals' AND public.is_editor_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can upload product originals" ON storage.objects;
CREATE POLICY "Staff can upload product originals"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-originals' AND public.is_editor_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can update product originals" ON storage.objects;
CREATE POLICY "Staff can update product originals"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-originals' AND public.is_editor_or_admin(auth.uid()))
WITH CHECK (bucket_id = 'product-originals' AND public.is_editor_or_admin(auth.uid()));

DROP POLICY IF EXISTS "Staff can delete product originals" ON storage.objects;
CREATE POLICY "Staff can delete product originals"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-originals' AND public.is_editor_or_admin(auth.uid()));