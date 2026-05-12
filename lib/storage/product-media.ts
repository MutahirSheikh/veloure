import "server-only";

import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES, PRODUCT_MEDIA_BUCKET } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { ensureSlug } from "@/lib/slug";

export type UploadedImage = {
  publicUrl: string;
  storagePath: string;
};

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

export async function uploadProductImage(file: File | null, scope: string): Promise<UploadedImage | null> {
  if (!file || file.size === 0) return null;

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Product images must be JPEG, PNG, WebP, or GIF files.");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Product images must be smaller than 5 MB.");
  }

  const supabase = getSupabaseAdminClient();
  const safeScope = ensureSlug(scope, "product");
  const safeName = ensureSlug(file.name.replace(/\.[^.]+$/, ""), "image");
  const storagePath = `${safeScope}/${Date.now()}-${crypto.randomUUID()}-${safeName}.${extensionFor(file)}`;
  const bytes = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(PRODUCT_MEDIA_BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage.from(PRODUCT_MEDIA_BUCKET).getPublicUrl(storagePath);
  return {
    publicUrl: data.publicUrl,
    storagePath
  };
}
