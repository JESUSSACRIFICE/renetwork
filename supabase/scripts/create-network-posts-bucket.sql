-- Network feed photos: database column + public storage bucket + RLS policies.
-- Forces `network-posts` to be public (fixes buckets created private in the Dashboard).
-- Or: Storage → network-posts → ⋮ → Edit → enable “Public bucket”.
--
-- Run the whole file in Supabase → SQL Editor if you see:
--   • PGRST204 / "Could not find the 'image_urls' column of 'network_posts'"
--   • "Bucket not found" on upload
--
-- After running, wait ~1 minute or use Dashboard → Settings → API → Reload schema (if available)
-- so PostgREST picks up the new column.

-- 1) Column on network_posts (required for inserts with image_urls)
ALTER TABLE public.network_posts
  ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.network_posts.image_urls IS 'Public URLs of images attached to the post (JSON array of strings)';

-- 2) Public bucket + policies (ensure public = true even if bucket already existed as private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('network-posts', 'network-posts', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  name = EXCLUDED.name;

UPDATE storage.buckets
SET public = true
WHERE id = 'network-posts';

DROP POLICY IF EXISTS "network_posts_images_insert_own" ON storage.objects;
CREATE POLICY "network_posts_images_insert_own"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'network-posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "network_posts_images_select_public" ON storage.objects;
CREATE POLICY "network_posts_images_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'network-posts');

DROP POLICY IF EXISTS "network_posts_images_update_own" ON storage.objects;
CREATE POLICY "network_posts_images_update_own"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'network-posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "network_posts_images_delete_own" ON storage.objects;
CREATE POLICY "network_posts_images_delete_own"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'network-posts'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
