import { supabase } from "@/integrations/supabase/client";

/** Public bucket for feed images. Create it in Supabase (Storage → New bucket) or run `supabase/scripts/create-network-posts-bucket.sql`. */
export const NETWORK_POSTS_STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_NETWORK_POSTS_BUCKET?.trim() || "network-posts";

const MAX_FILES = 6;
const MAX_BYTES = 5 * 1024 * 1024;

export function validateNetworkPostImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose image files only (JPEG, PNG, WebP, or GIF).";
  }
  if (file.size > MAX_BYTES) {
    return "Each image must be 5MB or smaller.";
  }
  return null;
}

/** Upload images to public storage; paths are scoped to `userId/`. */
export async function uploadNetworkPostImages(
  userId: string,
  files: File[]
): Promise<string[]> {
  if (files.length > MAX_FILES) {
    throw new Error(`You can attach up to ${MAX_FILES} images.`);
  }
  const urls: string[] = [];
  for (const file of files) {
    const err = validateNetworkPostImageFile(file);
    if (err) throw new Error(err);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
    const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
    const { error } = await supabase.storage
      .from(NETWORK_POSTS_STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
    if (error) {
      const msg = error.message ?? "";
      if (
        msg.includes("Bucket not found") ||
        (error as { statusCode?: string }).statusCode === "404"
      ) {
        throw new Error(
          `STORAGE_BUCKET_MISSING:${NETWORK_POSTS_STORAGE_BUCKET}`
        );
      }
      throw error;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from(NETWORK_POSTS_STORAGE_BUCKET).getPublicUrl(path);
    urls.push(publicUrl);
  }
  return urls;
}

export function getNetworkPostUploadErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.startsWith("STORAGE_BUCKET_MISSING:")) {
    const name = raw.slice("STORAGE_BUCKET_MISSING:".length);
    return `Photo storage isn’t set up yet. In Supabase: open Storage → New bucket → name it exactly "${name}" → turn on Public. Then open SQL Editor and run the script supabase/scripts/create-network-posts-bucket.sql (or run all migrations). Optional: set NEXT_PUBLIC_SUPABASE_NETWORK_POSTS_BUCKET if you use a different bucket name.`;
  }
  return raw || "Upload failed";
}

/** Maps Supabase/PostgREST errors when saving a post (upload already succeeded or text-only). */
export function getNetworkFeedPostSaveErrorMessage(error: unknown): string {
  const e = error as { code?: string; message?: string };
  const msg = e?.message ?? (error instanceof Error ? error.message : String(error));
  if (
    e?.code === "PGRST204" ||
    (typeof msg === "string" && msg.includes("image_urls"))
  ) {
    return `Your database is missing the image_urls column on network_posts. In Supabase → SQL Editor, run the full script supabase/scripts/create-network-posts-bucket.sql (it starts with ALTER TABLE … ADD COLUMN image_urls). Wait a minute for the API schema cache to refresh, then try again.`;
  }
  return getNetworkPostUploadErrorMessage(error);
}
