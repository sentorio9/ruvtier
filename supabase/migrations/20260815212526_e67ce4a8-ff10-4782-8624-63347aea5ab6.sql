-- ── service_role: full access everywhere ────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ── anon: public read surface (column-scoped) ───────────────────────────
GRANT SELECT (
  id, name, slug, collection, gender_segment, description, long_description,
  price, compare_at_price, sku, status, featured, materials, care_info,
  size_options, color_options, media_gallery, thumbnail_url, hero_image_url,
  seo_title, seo_description, created_at, updated_at, deleted_at,
  preorder_enabled, preorder_statement, availability, edition_size,
  stock_state, allocation_state
) ON public.products TO anon;

GRANT SELECT (
  id, product_id, title, sku, size, colour, colour_hex, price,
  compare_at_price, currency, image_url, status, position,
  stock_state, created_at, updated_at
) ON public.product_variants TO anon;

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_settings TO anon;

-- ── anon: public write surface (RLS-gated inserts only) ─────────────────
GRANT INSERT ON public.preorder_requests TO anon;
GRANT INSERT ON public.appointment_requests TO anon;
GRANT INSERT ON public.maintenance_subscribers TO anon;

-- ── authenticated: clients + staff, all gated by RLS ────────────────────
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.products,
  public.product_variants,
  public.preorder_requests,
  public.appointment_requests,
  public.maintenance_subscribers,
  public.customers,
  public.orders,
  public.order_items,
  public.carts,
  public.profiles,
  public.admin_profiles,
  public.site_content,
  public.site_settings,
  public.site_snapshots,
  public.stock_movements,
  public.content_versions,
  public.audit_logs,
  public.user_roles,
  public.suppressed_emails
TO authenticated;

GRANT SELECT ON public.payment_events TO authenticated;
GRANT SELECT ON public.email_send_log TO authenticated;