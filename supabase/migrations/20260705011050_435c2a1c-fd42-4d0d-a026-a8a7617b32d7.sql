
-- ============ product_variants ============
CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  title text,
  sku text UNIQUE,
  barcode text,
  size text,
  colour text,
  colour_hex text,
  price numeric(10,2),
  compare_at_price numeric(10,2),
  currency text DEFAULT 'GBP',
  stock_quantity integer NOT NULL DEFAULT 0,
  reserved_quantity integer NOT NULL DEFAULT 0,
  available_quantity integer GENERATED ALWAYS AS (stock_quantity - reserved_quantity) STORED,
  low_stock_threshold integer DEFAULT 2,
  weight_grams integer,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  stripe_price_id text,
  position integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);

GRANT SELECT ON public.product_variants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view variants of active products"
ON public.product_variants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id
      AND p.status = 'active'
      AND p.deleted_at IS NULL
  )
);

CREATE POLICY "Editors and admins manage variants"
ON public.product_variants FOR ALL
TO authenticated
USING (public.is_editor_or_admin(auth.uid()))
WITH CHECK (public.is_editor_or_admin(auth.uid()));

CREATE TRIGGER trg_product_variants_updated_at
BEFORE UPDATE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ stock_movements ============
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  change_quantity integer NOT NULL,
  movement_type text NOT NULL,
  reason text,
  previous_quantity integer,
  new_quantity integer,
  note text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT stock_movements_type_chk CHECK (movement_type IN (
    'stock_added','stock_removed','manual_adjustment','reserved',
    'reservation_released','sold','returned','damaged','correction'
  ))
);
CREATE INDEX idx_stock_movements_variant ON public.stock_movements(variant_id);
CREATE INDEX idx_stock_movements_created ON public.stock_movements(created_at DESC);

GRANT SELECT, INSERT ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors and admins view stock movements"
ON public.stock_movements FOR SELECT TO authenticated
USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Editors and admins insert stock movements"
ON public.stock_movements FOR INSERT TO authenticated
WITH CHECK (public.is_editor_or_admin(auth.uid()));

-- ============ order_items ============
CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_title text,
  variant_title text,
  sku text,
  size text,
  colour text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric(10,2),
  total_price numeric(10,2),
  currency text DEFAULT 'GBP',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage order items"
ON public.order_items FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- ============ payment_events ============
CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  payment_intent_id text,
  checkout_session_id text,
  processed boolean NOT NULL DEFAULT false,
  processed_at timestamptz,
  error_message text,
  safe_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_payment_events_order ON public.payment_events(order_id);

GRANT SELECT ON public.payment_events TO authenticated;
GRANT ALL ON public.payment_events TO service_role;

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view payment events"
ON public.payment_events FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- ============ extend orders ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS fulfilment_status text,
  ADD COLUMN IF NOT EXISTS currency text DEFAULT 'GBP';

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON public.orders(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_pi ON public.orders(stripe_payment_intent_id);
