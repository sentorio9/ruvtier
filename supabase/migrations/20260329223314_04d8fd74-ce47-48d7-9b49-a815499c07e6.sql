
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS preorder_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS preorder_statement text;

CREATE TABLE public.preorder_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  country text,
  size_preference text,
  delivery_region text,
  message text,
  user_id uuid,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.preorder_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit preorder request"
  ON public.preorder_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own preorder requests"
  ON public.preorder_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage preorder requests"
  ON public.preorder_requests FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE TRIGGER update_preorder_requests_updated_at
  BEFORE UPDATE ON public.preorder_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE UNIQUE INDEX idx_preorder_unique_email_product
  ON public.preorder_requests (email, product_id)
  WHERE status != 'declined';
