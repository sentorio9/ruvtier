
CREATE OR REPLACE FUNCTION public.sync_preorder_to_customer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.customers (email, name, user_id, status, last_activity_at)
  VALUES (NEW.email, NEW.full_name, NEW.user_id, 'active', now())
  ON CONFLICT (email) DO UPDATE SET
    last_activity_at = now(),
    name = COALESCE(NULLIF(customers.name, ''), EXCLUDED.name);
  RETURN NEW;
END;
$$;

-- Add unique constraint on email for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'customers_email_unique'
  ) THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_email_unique UNIQUE (email);
  END IF;
END $$;

CREATE TRIGGER trg_preorder_sync_customer
AFTER INSERT ON public.preorder_requests
FOR EACH ROW
EXECUTE FUNCTION public.sync_preorder_to_customer();
