DO $$
DECLARE tbl record;
BEGIN
  FOR tbl IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r' LOOP
    EXECUTE format('GRANT ALL ON public.%I TO service_role', tbl.relname);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', tbl.relname);
  END LOOP;
END $$;

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_settings TO anon;
GRANT INSERT ON public.preorder_requests TO anon;
GRANT INSERT ON public.maintenance_subscribers TO anon;