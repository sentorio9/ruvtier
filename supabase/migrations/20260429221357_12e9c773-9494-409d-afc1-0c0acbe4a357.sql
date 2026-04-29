ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS availability text NOT NULL DEFAULT 'in_store';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_availability_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_availability_check
  CHECK (availability IN ('in_store', 'made_to_measure', 'by_allocation'));

CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products (availability);