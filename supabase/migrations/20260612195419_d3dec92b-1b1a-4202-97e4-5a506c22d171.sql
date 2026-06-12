ALTER TABLE public.preorder_requests
  ADD CONSTRAINT chk_preorder_full_name_len  CHECK (char_length(full_name)  <= 200),
  ADD CONSTRAINT chk_preorder_message_len    CHECK (message IS NULL OR char_length(message) <= 2000),
  ADD CONSTRAINT chk_preorder_country_len    CHECK (country IS NULL OR char_length(country) <= 100),
  ADD CONSTRAINT chk_preorder_size_pref_len  CHECK (size_preference IS NULL OR char_length(size_preference) <= 50),
  ADD CONSTRAINT chk_preorder_delivery_region_len CHECK (delivery_region IS NULL OR char_length(delivery_region) <= 100),
  ADD CONSTRAINT chk_preorder_email_len      CHECK (char_length(email) <= 320);

ALTER TABLE public.maintenance_subscribers
  ADD CONSTRAINT chk_maintenance_email_len   CHECK (char_length(email) <= 320);