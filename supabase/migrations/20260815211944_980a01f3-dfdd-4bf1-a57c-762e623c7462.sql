-- A3: remove blanket anon grants across the public schema, then re-grant the minimum.
DO $$
DECLARE tbl record;
BEGIN
  FOR tbl IN
    SELECT c.relname FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
  LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', tbl.relname);
  END LOOP;
END $$;

-- Public read surfaces (each backed by an existing anon SELECT policy)
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_settings TO anon;

-- Public write surfaces: insert-only lead capture
GRANT INSERT ON public.appointment_requests TO anon;
GRANT INSERT ON public.preorder_requests TO anon;
GRANT INSERT ON public.maintenance_subscribers TO anon;