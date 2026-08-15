CREATE OR REPLACE FUNCTION public.enforce_public_submission_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
  v_cap constant integer := 5;
BEGIN
  -- Staff bypass
  IF auth.uid() IS NOT NULL AND public.is_editor_or_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  EXECUTE format(
    'SELECT count(*) FROM public.%I WHERE lower(email) = lower($1) AND created_at > now() - interval ''24 hours''',
    TG_TABLE_NAME
  )
  INTO v_count
  USING NEW.email;

  IF v_count >= v_cap THEN
    RAISE EXCEPTION 'too_many_requests'
      USING HINT = 'Please wait before submitting another request.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_public_submission_cap() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_cap_preorder_requests ON public.preorder_requests;
CREATE TRIGGER trg_cap_preorder_requests
BEFORE INSERT ON public.preorder_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_public_submission_cap();

DROP TRIGGER IF EXISTS trg_cap_appointment_requests ON public.appointment_requests;
CREATE TRIGGER trg_cap_appointment_requests
BEFORE INSERT ON public.appointment_requests
FOR EACH ROW EXECUTE FUNCTION public.enforce_public_submission_cap();

DROP TRIGGER IF EXISTS trg_cap_maintenance_subscribers ON public.maintenance_subscribers;
CREATE TRIGGER trg_cap_maintenance_subscribers
BEFORE INSERT ON public.maintenance_subscribers
FOR EACH ROW EXECUTE FUNCTION public.enforce_public_submission_cap();