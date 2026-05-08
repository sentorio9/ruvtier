
-- Buckets remain "public" so files are reachable by direct URL via the CDN,
-- but we drop the broad SELECT policy on storage.objects which allowed
-- anonymous clients to LIST every object in the bucket.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view site images" ON storage.objects;
