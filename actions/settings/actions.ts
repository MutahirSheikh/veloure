"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { requireAdminProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { uploadProductImage } from "@/lib/storage/product-media";
import { settingsSchema } from "@/lib/validators/settings";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

export async function updateSettingsAction(input: unknown): Promise<ActionResult<{ id: number }>> {
  try {
    const admin = await requireAdminProfile();
    const parsed = settingsSchema.parse(input);
    const supabase = getSupabaseAdminClient();

    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...parsed }, { onConflict: "id" });
    if (error) throw error;

    await supabase.from("admin_audit_logs").insert({
      actor_clerk_user_id: admin.clerk_user_id,
      action: "settings.updated",
      entity_type: "site_settings",
      entity_id: null,
      payload: { store_name: parsed.store_name }
    });

    revalidateTag(CACHE_TAGS.settings);
    revalidateTag(CACHE_TAGS.catalog);
    return ok({ id: 1 }, "Settings saved.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function uploadSettingsImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const admin = await requireAdminProfile();
    const value = formData.get("image");
    const file = value instanceof File && value.size > 0 ? value : null;
    if (!file) throw new Error("Choose an image first.");

    const uploaded = await uploadProductImage(file, "settings");
    if (!uploaded) throw new Error("Image upload failed.");

    const supabase = getSupabaseAdminClient();
    await supabase.from("admin_audit_logs").insert({
      actor_clerk_user_id: admin.clerk_user_id,
      action: "settings.image_uploaded",
      entity_type: "site_settings",
      entity_id: null,
      payload: { storage_path: uploaded.storagePath }
    });

    return ok({ url: uploaded.publicUrl }, "Image uploaded.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
