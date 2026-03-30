-- Site content key-value store for CMS
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text UNIQUE NOT NULL,
  content_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  section text NOT NULL DEFAULT 'general',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage site content" ON public.site_content
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Public can read site content" ON public.site_content
  FOR SELECT TO anon
  USING (true);

INSERT INTO public.site_content (content_key, section, content_value) VALUES
  ('homepage_hero', 'homepage', '{"heading": "RUVTIER", "subheading": "Refined garments shaped by material devotion", "cta_text": "Explore Collection", "cta_link": "/boutique/women"}'::jsonb),
  ('the_house', 'pages', '{"heading": "The House", "body": "A place of quiet intention."}'::jsonb),
  ('stillness', 'pages', '{"heading": "Stillness", "body": "Where design meets repose."}'::jsonb),
  ('footer_social', 'footer', '{"instagram": "", "pinterest": "", "linkedin": ""}'::jsonb),
  ('contact_details', 'pages', '{"email": "", "phone": "", "address": ""}'::jsonb),
  ('seo_global', 'seo', '{"title": "RUVTIER — Luxury Garments", "description": "Refined garments shaped by material devotion and quiet intention."}'::jsonb);

CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid,
  email text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  item_count integer NOT NULL DEFAULT 0,
  subtotal numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  abandoned_at timestamptz,
  recovered_at timestamptz
);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage carts" ON public.carts
  FOR ALL TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can manage own cart" ON public.carts
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anon can manage session cart" ON public.carts
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();