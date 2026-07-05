
-- 1) Table
CREATE TABLE public.appointment_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  appointment_type TEXT NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT appointment_requests_type_check CHECK (appointment_type IN ('private_consultation','made_to_measure','collection_viewing','client_services')),
  CONSTRAINT appointment_requests_status_check CHECK (status IN ('pending','confirmed','completed','cancelled'))
);

-- 2) Grants
GRANT INSERT ON public.appointment_requests TO anon;
GRANT SELECT, INSERT, UPDATE ON public.appointment_requests TO authenticated;
GRANT ALL ON public.appointment_requests TO service_role;

-- 3) RLS
ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;

-- 4) Policies
CREATE POLICY "Anyone can submit an appointment request"
  ON public.appointment_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins and editors can view appointment requests"
  ON public.appointment_requests
  FOR SELECT
  TO authenticated
  USING (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Admins and editors can update appointment requests"
  ON public.appointment_requests
  FOR UPDATE
  TO authenticated
  USING (public.is_editor_or_admin(auth.uid()))
  WITH CHECK (public.is_editor_or_admin(auth.uid()));

CREATE POLICY "Only super admins can delete appointment requests"
  ON public.appointment_requests
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role));

-- 5) updated_at trigger
CREATE TRIGGER update_appointment_requests_updated_at
BEFORE UPDATE ON public.appointment_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Sync to customers CRM (mirrors sync_preorder_to_customer)
CREATE OR REPLACE FUNCTION public.sync_appointment_to_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

REVOKE EXECUTE ON FUNCTION public.sync_appointment_to_customer() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER sync_appointment_to_customer_trigger
AFTER INSERT ON public.appointment_requests
FOR EACH ROW EXECUTE FUNCTION public.sync_appointment_to_customer();
