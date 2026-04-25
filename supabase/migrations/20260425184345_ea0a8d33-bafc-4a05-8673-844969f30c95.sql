-- Create public bucket for site-wide editorial images managed by admins.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Public can view; only authenticated admins can write.
create policy "Site images are publicly readable"
on storage.objects for select
using (bucket_id = 'site-images');

create policy "Admins can upload site images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'site-images' and public.is_admin(auth.uid()));

create policy "Admins can update site images"
on storage.objects for update
to authenticated
using (bucket_id = 'site-images' and public.is_admin(auth.uid()))
with check (bucket_id = 'site-images' and public.is_admin(auth.uid()));

create policy "Admins can delete site images"
on storage.objects for delete
to authenticated
using (bucket_id = 'site-images' and public.is_admin(auth.uid()));

-- Seed empty site_image rows (idempotent) so the admin UI has slots to edit.
insert into public.site_content (content_key, section, content_value)
values
  ('site_image_home_hero',          'site_images', '{"url":""}'::jsonb),
  ('site_image_house_background',   'site_images', '{"url":""}'::jsonb),
  ('site_image_stillness_background','site_images','{"url":""}'::jsonb),
  ('site_image_materials_background','site_images','{"url":""}'::jsonb),
  ('site_image_editorial_cover',    'site_images', '{"url":""}'::jsonb),
  ('site_image_social_share',       'site_images', '{"url":""}'::jsonb)
on conflict (content_key) do nothing;