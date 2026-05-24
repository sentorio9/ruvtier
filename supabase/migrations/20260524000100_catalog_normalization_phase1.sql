-- RUVTIER admin rebuild phase 1: additive catalog normalization.
--
-- This migration is intentionally non-destructive:
-- - existing public.products data remains in place for the current storefront
-- - new normalized tables are populated from products for Phase 2 reads
-- - Shopify mapping fields are added now, but Shopify is not authoritative
--
-- Manual rollback is additive-object only: drop the new tables, helper function,
-- indexes, policies, and Shopify mapping columns. No legacy products rows are
-- mutated or removed by this migration.

-- -----------------------------------------------------------------------------
-- Shopify-ready product mapping fields on the legacy/source product row.
-- -----------------------------------------------------------------------------
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shopify_product_id text,
  ADD COLUMN IF NOT EXISTS shopify_handle text,
  ADD COLUMN IF NOT EXISTS shopify_status text,
  ADD COLUMN IF NOT EXISTS shopify_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS sync_status text NOT NULL DEFAULT 'local';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_sync_status_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_sync_status_check
      CHECK (sync_status IN ('local', 'pending', 'synced', 'error'));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_shopify_product_id
  ON public.products (shopify_product_id)
  WHERE shopify_product_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_sync_status
  ON public.products (sync_status);

-- -----------------------------------------------------------------------------
-- Normalized catalog tables.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 1,
  option_values jsonb NOT NULL DEFAULT '[]'::jsonb,
  shopify_option_id text,
  sync_status text NOT NULL DEFAULT 'local' CHECK (sync_status IN ('local', 'pending', 'synced', 'error')),
  shopify_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, name)
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Default',
  sku text,
  barcode text,
  option_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  price numeric(10,2),
  compare_at_price numeric(10,2),
  position integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  is_default boolean NOT NULL DEFAULT false,
  requires_shipping boolean NOT NULL DEFAULT true,
  taxable boolean NOT NULL DEFAULT true,
  shopify_variant_id text,
  shopify_inventory_item_id text,
  sync_status text NOT NULL DEFAULT 'local' CHECK (sync_status IN ('local', 'pending', 'synced', 'error')),
  shopify_synced_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  url text NOT NULL,
  alt_text text,
  position integer NOT NULL DEFAULT 1,
  role text NOT NULL DEFAULT 'gallery' CHECK (role IN ('thumbnail', 'hero', 'gallery')),
  storage_bucket text,
  storage_path text,
  content_type text,
  file_size_bytes integer,
  shopify_image_id text,
  sync_status text NOT NULL DEFAULT 'local' CHECK (sync_status IN ('local', 'pending', 'synced', 'error')),
  shopify_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL UNIQUE REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity_available integer NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_committed integer NOT NULL DEFAULT 0 CHECK (quantity_committed >= 0),
  quantity_incoming integer NOT NULL DEFAULT 0 CHECK (quantity_incoming >= 0),
  inventory_policy text NOT NULL DEFAULT 'deny' CHECK (inventory_policy IN ('deny', 'continue')),
  tracked boolean NOT NULL DEFAULT true,
  shopify_inventory_item_id text,
  shopify_location_id text,
  sync_status text NOT NULL DEFAULT 'local' CHECK (sync_status IN ('local', 'pending', 'synced', 'error')),
  shopify_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_options_product_id
  ON public.product_options (product_id, position);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON public.product_variants (product_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_one_default
  ON public.product_variants (product_id)
  WHERE is_default = true AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_variants_shopify_variant_id
  ON public.product_variants (shopify_variant_id)
  WHERE shopify_variant_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON public.product_images (product_id, role, position);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_product_role_position
  ON public.product_images (product_id, role, position);

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_images_shopify_image_id
  ON public.product_images (shopify_image_id)
  WHERE shopify_image_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_inventory_variant_id
  ON public.product_inventory (variant_id);

-- updated_at triggers. CREATE TRIGGER has no IF NOT EXISTS, so guard manually.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_options_updated_at') THEN
    CREATE TRIGGER update_product_options_updated_at
    BEFORE UPDATE ON public.product_options
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_variants_updated_at') THEN
    CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_images_updated_at') THEN
    CREATE TRIGGER update_product_images_updated_at
    BEFORE UPDATE ON public.product_images
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_inventory_updated_at') THEN
    CREATE TRIGGER update_product_inventory_updated_at
    BEFORE UPDATE ON public.product_inventory
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- RLS: public storefront can read normalized data for active products; admins can
-- manage it. Writes still require authenticated admin RLS and will move behind
-- Edge Functions in Phase 3.
-- -----------------------------------------------------------------------------
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active product options" ON public.product_options;
CREATE POLICY "Public can view active product options"
ON public.product_options FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_options.product_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Admins can manage product options" ON public.product_options;
CREATE POLICY "Admins can manage product options"
ON public.product_options FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view active product variants" ON public.product_variants;
CREATE POLICY "Public can view active product variants"
ON public.product_variants FOR SELECT TO anon, authenticated
USING (
  deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Admins can manage product variants" ON public.product_variants;
CREATE POLICY "Admins can manage product variants"
ON public.product_variants FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view active product images" ON public.product_images;
CREATE POLICY "Public can view active product images"
ON public.product_images FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_images.product_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Admins can manage product images" ON public.product_images;
CREATE POLICY "Admins can manage product images"
ON public.product_images FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public can view active product inventory" ON public.product_inventory;
CREATE POLICY "Public can view active product inventory"
ON public.product_inventory FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.product_variants v
    JOIN public.products p ON p.id = v.product_id
    WHERE v.id = product_inventory.variant_id
      AND v.deleted_at IS NULL
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

DROP POLICY IF EXISTS "Admins can manage product inventory" ON public.product_inventory;
CREATE POLICY "Admins can manage product inventory"
ON public.product_inventory FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- Idempotent legacy data backfill.
--
-- Existing products do not have per-option inventory. To avoid inventing stock,
-- each product gets one default variant carrying the product-level price, SKU,
-- and stock. Size/color choices are preserved in product_options for Phase 2.
-- -----------------------------------------------------------------------------
INSERT INTO public.product_options (product_id, name, position, option_values)
SELECT
  p.id,
  'Size',
  1,
  CASE
    WHEN jsonb_typeof(COALESCE(p.size_options, '[]'::jsonb)) = 'array' THEN COALESCE(p.size_options, '[]'::jsonb)
    ELSE '[]'::jsonb
  END
FROM public.products p
WHERE jsonb_array_length(
  CASE
    WHEN jsonb_typeof(COALESCE(p.size_options, '[]'::jsonb)) = 'array' THEN COALESCE(p.size_options, '[]'::jsonb)
    ELSE '[]'::jsonb
  END
) > 0
ON CONFLICT (product_id, name) DO NOTHING;

INSERT INTO public.product_options (product_id, name, position, option_values)
SELECT
  p.id,
  'Color',
  CASE
    WHEN jsonb_array_length(
      CASE
        WHEN jsonb_typeof(COALESCE(p.size_options, '[]'::jsonb)) = 'array' THEN COALESCE(p.size_options, '[]'::jsonb)
        ELSE '[]'::jsonb
      END
    ) > 0 THEN 2
    ELSE 1
  END,
  CASE
    WHEN jsonb_typeof(COALESCE(p.color_options, '[]'::jsonb)) = 'array' THEN COALESCE(p.color_options, '[]'::jsonb)
    ELSE '[]'::jsonb
  END
FROM public.products p
WHERE jsonb_array_length(
  CASE
    WHEN jsonb_typeof(COALESCE(p.color_options, '[]'::jsonb)) = 'array' THEN COALESCE(p.color_options, '[]'::jsonb)
    ELSE '[]'::jsonb
  END
) > 0
ON CONFLICT (product_id, name) DO NOTHING;

INSERT INTO public.product_variants (
  product_id,
  title,
  sku,
  option_values,
  price,
  compare_at_price,
  position,
  status,
  is_default
)
SELECT
  p.id,
  'Default',
  NULLIF(p.sku, ''),
  '{}'::jsonb,
  p.price,
  p.compare_at_price,
  1,
  p.status,
  true
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.product_variants v
  WHERE v.product_id = p.id
    AND v.is_default = true
    AND v.deleted_at IS NULL
);

INSERT INTO public.product_inventory (variant_id, quantity_available)
SELECT
  v.id,
  GREATEST(COALESCE(p.stock_quantity, 0), 0)
FROM public.product_variants v
JOIN public.products p ON p.id = v.product_id
WHERE v.is_default = true
  AND v.deleted_at IS NULL
ON CONFLICT (variant_id) DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt_text, position, role)
SELECT
  p.id,
  p.thumbnail_url,
  p.name,
  0,
  'thumbnail'
FROM public.products p
WHERE NULLIF(BTRIM(COALESCE(p.thumbnail_url, '')), '') IS NOT NULL
ON CONFLICT (product_id, role, position) DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt_text, position, role)
SELECT
  p.id,
  p.hero_image_url,
  p.name,
  0,
  'hero'
FROM public.products p
WHERE NULLIF(BTRIM(COALESCE(p.hero_image_url, '')), '') IS NOT NULL
ON CONFLICT (product_id, role, position) DO NOTHING;

INSERT INTO public.product_images (product_id, url, alt_text, position, role)
SELECT
  p.id,
  g.url,
  p.name,
  g.ord::integer,
  'gallery'
FROM public.products p
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE
    WHEN jsonb_typeof(COALESCE(p.media_gallery, '[]'::jsonb)) = 'array' THEN COALESCE(p.media_gallery, '[]'::jsonb)
    ELSE '[]'::jsonb
  END
) WITH ORDINALITY AS g(url, ord)
WHERE NULLIF(BTRIM(g.url), '') IS NOT NULL
ON CONFLICT (product_id, role, position) DO NOTHING;

-- -----------------------------------------------------------------------------
-- Verification helper. Run this after applying migrations:
--   select * from public.verify_catalog_normalization();
-- All rows should return ok = true before Phase 2 switches reads.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_catalog_normalization()
RETURNS TABLE (
  check_name text,
  expected bigint,
  actual bigint,
  ok boolean,
  details jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expected_count bigint;
  actual_count bigint;
BEGIN
  IF auth.role() <> 'service_role' AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COUNT(*) INTO expected_count FROM public.products;
  SELECT COUNT(DISTINCT product_id) INTO actual_count
  FROM public.product_variants
  WHERE is_default = true AND deleted_at IS NULL;

  check_name := 'products_with_default_variant';
  expected := expected_count;
  actual := actual_count;
  ok := expected_count = actual_count;
  details := jsonb_build_object('description', 'Every legacy product has one default normalized variant.');
  RETURN NEXT;

  SELECT COUNT(*) INTO expected_count
  FROM public.products p
  WHERE jsonb_array_length(
    CASE
      WHEN jsonb_typeof(COALESCE(p.size_options, '[]'::jsonb)) = 'array' THEN COALESCE(p.size_options, '[]'::jsonb)
      ELSE '[]'::jsonb
    END
  ) > 0;

  SELECT COUNT(*) INTO actual_count
  FROM public.product_options
  WHERE name = 'Size'
    AND jsonb_array_length(option_values) > 0;

  check_name := 'size_options_preserved';
  expected := expected_count;
  actual := actual_count;
  ok := expected_count = actual_count;
  details := jsonb_build_object('description', 'Products with legacy size_options have a Size option row.');
  RETURN NEXT;

  SELECT COUNT(*) INTO expected_count
  FROM public.products p
  WHERE jsonb_array_length(
    CASE
      WHEN jsonb_typeof(COALESCE(p.color_options, '[]'::jsonb)) = 'array' THEN COALESCE(p.color_options, '[]'::jsonb)
      ELSE '[]'::jsonb
    END
  ) > 0;

  SELECT COUNT(*) INTO actual_count
  FROM public.product_options
  WHERE name = 'Color'
    AND jsonb_array_length(option_values) > 0;

  check_name := 'color_options_preserved';
  expected := expected_count;
  actual := actual_count;
  ok := expected_count = actual_count;
  details := jsonb_build_object('description', 'Products with legacy color_options have a Color option row.');
  RETURN NEXT;

  SELECT COALESCE(SUM(jsonb_array_length(
    CASE
      WHEN jsonb_typeof(COALESCE(p.media_gallery, '[]'::jsonb)) = 'array' THEN COALESCE(p.media_gallery, '[]'::jsonb)
      ELSE '[]'::jsonb
    END
  )), 0)::bigint INTO expected_count
  FROM public.products p;

  SELECT COUNT(*) INTO actual_count
  FROM public.product_images
  WHERE role = 'gallery';

  check_name := 'gallery_images_preserved';
  expected := expected_count;
  actual := actual_count;
  ok := expected_count = actual_count;
  details := jsonb_build_object('description', 'Legacy media_gallery entries map to ordered gallery images.');
  RETURN NEXT;

  SELECT COUNT(*) INTO expected_count
  FROM public.products
  WHERE NULLIF(BTRIM(COALESCE(thumbnail_url, '')), '') IS NOT NULL;

  SELECT COUNT(*) INTO actual_count
  FROM public.product_images
  WHERE role = 'thumbnail';

  check_name := 'thumbnail_images_preserved';
  expected := expected_count;
  actual := actual_count;
  ok := expected_count = actual_count;
  details := jsonb_build_object('description', 'Legacy thumbnail_url values map to thumbnail image rows.');
  RETURN NEXT;

  SELECT COUNT(*) INTO expected_count
  FROM public.products
  WHERE NULLIF(BTRIM(COALESCE(hero_image_url, '')), '') IS NOT NULL;

  SELECT COUNT(*) INTO actual_count
  FROM public.product_images
  WHERE role = 'hero';

  check_name := 'hero_images_preserved';
  expected := expected_count;
  actual := actual_count;
  ok := expected_count = actual_count;
  details := jsonb_build_object('description', 'Legacy hero_image_url values map to hero image rows.');
  RETURN NEXT;

  expected_count := 0;
  SELECT COUNT(*) INTO actual_count
  FROM public.products p
  JOIN public.product_variants v
    ON v.product_id = p.id
   AND v.is_default = true
   AND v.deleted_at IS NULL
  WHERE v.price IS DISTINCT FROM p.price
     OR v.compare_at_price IS DISTINCT FROM p.compare_at_price
     OR v.sku IS DISTINCT FROM NULLIF(p.sku, '');

  check_name := 'default_variant_commerce_mismatches';
  expected := expected_count;
  actual := actual_count;
  ok := actual_count = 0;
  details := jsonb_build_object('description', 'Default variant price, compare-at price, and SKU match legacy product fields.');
  RETURN NEXT;

  expected_count := 0;
  SELECT COUNT(*) INTO actual_count
  FROM public.products p
  JOIN public.product_variants v
    ON v.product_id = p.id
   AND v.is_default = true
   AND v.deleted_at IS NULL
  LEFT JOIN public.product_inventory i ON i.variant_id = v.id
  WHERE COALESCE(i.quantity_available, -1) IS DISTINCT FROM GREATEST(COALESCE(p.stock_quantity, 0), 0);

  check_name := 'default_variant_inventory_mismatches';
  expected := expected_count;
  actual := actual_count;
  ok := actual_count = 0;
  details := jsonb_build_object('description', 'Default variant inventory matches legacy stock_quantity.');
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.verify_catalog_normalization() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_catalog_normalization() FROM anon;
REVOKE ALL ON FUNCTION public.verify_catalog_normalization() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.verify_catalog_normalization() TO authenticated, service_role;
