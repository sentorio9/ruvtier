-- C4: coarse, server-computed signals instead of exact integers
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS stock_state text
  GENERATED ALWAYS AS (
    CASE
      WHEN COALESCE(stock_quantity, 0) <= 0 THEN 'closed'
      WHEN stock_quantity <= 3 THEN 'low'
      ELSE 'available'
    END
  ) STORED;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS allocation_state text
  GENERATED ALWAYS AS (
    CASE
      WHEN edition_size IS NULL THEN NULL
      WHEN allocated_count >= edition_size THEN 'closed'
      WHEN (edition_size - allocated_count) <= GREATEST((edition_size / 4), 1) THEN 'limited'
      ELSE 'open'
    END
  ) STORED;

ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS stock_state text
  GENERATED ALWAYS AS (
    CASE
      WHEN GREATEST(stock_quantity - reserved_quantity, 0) <= 0 THEN 'closed'
      WHEN (stock_quantity - reserved_quantity) <= COALESCE(low_stock_threshold, 3) THEN 'low'
      ELSE 'available'
    END
  ) STORED;

-- C2/A17: column-level public read surface
REVOKE SELECT ON public.products FROM anon;
GRANT SELECT (
  id, name, slug, collection, gender_segment, description, long_description,
  price, compare_at_price, sku, status, featured, materials, care_info,
  size_options, color_options, media_gallery, thumbnail_url, hero_image_url,
  seo_title, seo_description, created_at, updated_at, deleted_at,
  preorder_enabled, preorder_statement, availability, edition_size,
  stock_state, allocation_state
) ON public.products TO anon;

REVOKE SELECT ON public.product_variants FROM anon;
GRANT SELECT (
  id, product_id, title, sku, size, colour, colour_hex, price, compare_at_price,
  currency, image_url, status, position, created_at, updated_at, stock_state
) ON public.product_variants TO anon;