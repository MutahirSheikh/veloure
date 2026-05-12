"use server";

import { revalidateTag } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { requireAdminProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
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
