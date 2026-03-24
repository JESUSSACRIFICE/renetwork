-- Images attached to network feed posts (public URLs in Supabase Storage)

ALTER TABLE public.network_posts
  ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.network_posts.image_urls IS 'Public URLs of images attached to the post (JSON array of strings)';

-- Public bucket for feed images (readable by anyone; uploads scoped to auth uid folder)
INSERT INTO storage.buckets (id, name, public)
VALUES ('network-posts', 'network-posts', true)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  name = EXCLUDED.name;

UPDATE storage.buckets SET public = true WHERE id = 'network-posts';

-- Authenticated users upload only under their user id folder
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
