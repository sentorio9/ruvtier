ALTER POLICY "Anyone can submit an appointment request" ON public.appointment_requests WITH CHECK (
  (
    length(trim(both from full_name)) >= 1
    AND length(trim(both from full_name)) <= 100
  )
  AND (
    length(trim(both from email)) >= 3
    AND length(trim(both from email)) <= 255
  )
  AND (email ~~ '%_@_%.__%')
  AND (
    appointment_type = ANY (
      ARRAY[
        'private_consultation'::text,
        'made_to_measure'::text,
        'collection_viewing'::text,
        'client_services'::text,
        'house_visit'::text
      ]
    )
  )
  AND ((message IS NULL) OR (length(message) <= 2000))
);