-- products: split FOR ALL admin/editor policies into write-only commands so SELECT path is unaffected
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Editors can manage products" ON public.products;

CREATE POLICY "Editors can insert products" ON public.products
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Editors can update products" ON public.products
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin(auth.uid()))
  WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON public.products
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));

-- site_content: same treatment; add an explicit public SELECT policy so reads still work
DROP POLICY IF EXISTS "Admins can manage site content" ON public.site_content;
DROP POLICY IF EXISTS "Editors can manage site content" ON public.site_content;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_content' AND cmd='SELECT'
  ) THEN
    CREATE POLICY "Public can view site content" ON public.site_content
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

CREATE POLICY "Editors can insert site content" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Editors can update site content" ON public.site_content
  FOR UPDATE TO authenticated
  USING (public.is_editor_or_admin(auth.uid()))
  WITH CHECK (public.is_editor_or_admin(auth.uid()));
CREATE POLICY "Admins can delete site content" ON public.site_content
  FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
