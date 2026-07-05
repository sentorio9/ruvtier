
DROP POLICY IF EXISTS "Anyone can submit an appointment request" ON public.appointment_requests;

CREATE POLICY "Anyone can submit an appointment request"
  ON public.appointment_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(full_name)) BETWEEN 1 AND 100
    AND length(trim(email)) BETWEEN 3 AND 255
    AND email LIKE '%_@_%.__%'
    AND appointment_type IN ('private_consultation','made_to_measure','collection_viewing','client_services')
    AND (message IS NULL OR length(message) <= 2000)
  );
