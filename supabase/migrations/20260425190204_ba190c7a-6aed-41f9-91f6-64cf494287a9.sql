-- 1. Add 'editor' value already exists in app_role enum (super_admin, admin, editor, support_viewer) ✓

-- 2. Maintenance mode + holding-page email capture
CREATE TABLE public.site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  maintenance_enabled BOOLEAN NOT NULL DEFAULT false,
  maintenance_headline TEXT NOT NULL DEFAULT 'The House is in quiet preparation.',
  maintenance_subline TEXT NOT NULL DEFAULT 'We are returning shortly. Leave your email and we will write to you when the doors reopen.',
  maintenance_collect_email BOOLEAN NOT NULL DEFAULT true,
  maintenance_started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by TEXT,
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);
INSERT INTO public.site_settings (id) VALUES (1);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Maintenance signup list (separate from main customers — these are people waiting for the doors to reopen)
CREATE TABLE public.maintenance_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.maintenance_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to maintenance updates"
  ON public.maintenance_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (email IS NOT NULL);

CREATE POLICY "Admins can read maintenance subscribers"
  ON public.maintenance_subscribers FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update maintenance subscribers"
  ON public.maintenance_subscribers FOR UPDATE TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 3. Per-change version history (every save to site_content / products / site_settings logged)
CREATE TABLE public.content_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,        -- 'site_content' | 'product' | 'site_settings'
  entity_id TEXT NOT NULL,          -- content_key, product id, or 'site_settings'
  entity_label TEXT,                -- human-readable label
  previous_value JSONB,
  new_value JSONB NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_content_versions_entity ON public.content_versions(entity_type, entity_id, changed_at DESC);
CREATE INDEX idx_content_versions_changed_at ON public.content_versions(changed_at DESC);

ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read content versions"
  ON public.content_versions FOR SELECT TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert content versions"
  ON public.content_versions FOR INSERT TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. Named full-site snapshots
CREATE TABLE public.site_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  site_content_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  products_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  site_settings_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_site_snapshots_created_at ON public.site_snapshots(created_at DESC);

ALTER TABLE public.site_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage snapshots"
  ON public.site_snapshots FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 5. Editor role helper — editors can edit content/products/images but NOT manage admins, toggle maintenance, see orders/customers, or delete
CREATE OR REPLACE FUNCTION public.is_editor_or_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin', 'admin', 'editor')
  )
$$;

-- Allow editors to manage products + site_content (in addition to existing admin policies)
CREATE POLICY "Editors can manage products"
  ON public.products FOR ALL TO authenticated
  USING (public.is_editor_or_admin(auth.uid()))
  WITH CHECK (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors can manage site content"
  ON public.site_content FOR ALL TO authenticated
  USING (public.is_editor_or_admin(auth.uid()))
  WITH CHECK (public.is_editor_or_admin(auth.uid()));

-- 6. updated_at trigger for site_settings
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();