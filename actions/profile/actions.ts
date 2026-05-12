"use server";

import { revalidatePath } from "next/cache";

import { requireUserProfile } from "@/lib/auth/profile";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { addressSchema, profileUpdateSchema } from "@/lib/validators/profile";
import { fail, getErrorMessage, ok, type ActionResult } from "@/lib/utils";

export async function updateProfileAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await requireUserProfile();
    const parsed = profileUpdateSchema.parse(input);
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("profiles").update(parsed).eq("id", profile.id);

    if (error) throw error;
    revalidatePath("/account/profile");
    return ok({ id: profile.id }, "Profile saved.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function upsertAddressAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await requireUserProfile();
    const parsed = addressSchema.parse(input);
    const supabase = getSupabaseAdminClient();

    if (parsed.is_default) {
      const { error } = await supabase.from("addresses").update({ is_default: false }).eq("profile_id", profile.id);
      if (error) throw error;
    }

    const payload = { ...parsed, profile_id: profile.id };
    const query = parsed.id
      ? supabase.from("addresses").update(payload).eq("id", parsed.id).eq("profile_id", profile.id).select("id").single()
      : supabase.from("addresses").insert(payload).select("id").single();

    const { data, error } = await query;
    if (error) throw error;
    revalidatePath("/account/addresses");
    return ok({ id: data.id as string }, parsed.id ? "Address saved." : "Address added.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function deleteAddressAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await requireUserProfile();
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("addresses").delete().eq("id", id).eq("profile_id", profile.id);

    if (error) throw error;
    revalidatePath("/account/addresses");
    return ok({ id }, "Address removed.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function setDefaultAddressAction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const profile = await requireUserProfile();
    const supabase = getSupabaseAdminClient();
    const { error: clearError } = await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("profile_id", profile.id);
    if (clearError) throw clearError;

    const { error } = await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id)
      .eq("profile_id", profile.id);

    if (error) throw error;
    revalidatePath("/account/addresses");
    return ok({ id }, "Default address updated.");
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}
