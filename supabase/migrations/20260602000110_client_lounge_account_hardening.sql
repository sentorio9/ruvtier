-- RUVTIER client lounge account hardening.
--
-- Customer accounts use Supabase Auth as the identity layer. This migration
-- keeps sensitive operational columns private while exposing safe account data
-- through service-defined RPCs scoped to auth.uid().

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at
  ON public.orders (user_id, created_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_email_created_at
  ON public.orders (lower(customer_email), created_at DESC)
  WHERE deleted_at IS NULL AND customer_email IS NOT NULL;

UPDATE public.orders o
SET user_id = c.user_id
FROM public.customers c
WHERE o.user_id IS NULL
  AND o.customer_id = c.id
  AND c.user_id IS NOT NULL;

UPDATE public.orders o
SET user_id = p.user_id
FROM public.profiles p
WHERE o.user_id IS NULL
  AND o.customer_email IS NOT NULL
  AND lower(o.customer_email) = lower(p.email);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id,
    lower(COALESCE(NEW.email, '')),
    NULLIF(BTRIM(COALESCE(NEW.raw_user_meta_data->>'display_name', '')), '')
  )
  ON CONFLICT (user_id) DO UPDATE
  SET email = EXCLUDED.email,
      display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name),
      updated_at = now();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_lounge_orders()
RETURNS TABLE(
  id uuid,
  order_number text,
  status text,
  payment_status text,
  line_items jsonb,
  subtotal numeric,
  tax numeric,
  shipping numeric,
  total numeric,
  fulfilled_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  current_email text := lower(COALESCE(auth.jwt()->>'email', ''));
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    COALESCE(o.line_items, '[]'::jsonb) AS line_items,
    COALESCE(o.subtotal, 0),
    COALESCE(o.tax, 0),
    COALESCE(o.shipping, 0),
    COALESCE(o.total, 0),
    o.fulfilled_at,
    o.cancelled_at,
    o.created_at,
    o.updated_at
  FROM public.orders o
  WHERE o.deleted_at IS NULL
    AND (
      o.user_id = current_user_id
      OR EXISTS (
        SELECT 1
        FROM public.customers c
        WHERE c.id = o.customer_id
          AND c.user_id = current_user_id
          AND c.deleted_at IS NULL
      )
      OR (
        o.user_id IS NULL
        AND current_email <> ''
        AND lower(COALESCE(o.customer_email, '')) = current_email
      )
    )
  ORDER BY o.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_client_lounge_carts()
RETURNS TABLE(
  id uuid,
  item_count integer,
  items jsonb,
  subtotal numeric,
  status text,
  created_at timestamptz,
  updated_at timestamptz,
  abandoned_at timestamptz,
  recovered_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT
    c.id,
    c.item_count,
    COALESCE(c.items, '[]'::jsonb) AS items,
    COALESCE(c.subtotal, 0),
    c.status,
    c.created_at,
    c.updated_at,
    c.abandoned_at,
    c.recovered_at
  FROM public.carts c
  WHERE c.user_id = current_user_id
  ORDER BY c.updated_at DESC
  LIMIT 10;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_client_lounge_orders() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_client_lounge_orders() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_client_lounge_orders() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_client_lounge_carts() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_client_lounge_carts() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_client_lounge_carts() TO authenticated;
