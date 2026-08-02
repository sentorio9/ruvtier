ALTER TABLE public.appointment_requests
DROP CONSTRAINT IF EXISTS appointment_requests_type_check;

ALTER TABLE public.appointment_requests
ADD CONSTRAINT appointment_requests_type_check
CHECK (
  appointment_type = ANY (
    ARRAY[
      'private_consultation'::text,
      'made_to_measure'::text,
      'collection_viewing'::text,
      'client_services'::text,
      'house_visit'::text
    ]
  )
);