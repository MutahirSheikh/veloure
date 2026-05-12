import "server-only";

import { isAdminEmail } from "@/lib/auth/admin-emails";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import type { AppRole, Profile } from "@/lib/db/types";

export type ClerkWebhookProfile = {
  clerkUserId: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
};

export async function syncClerkProfile(input: ClerkWebhookProfile) {
  if (!input.email) return null;

  const supabase = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("*")
    .or(`clerk_user_id.eq.${input.clerkUserId},email.eq.${input.email}`)
    .maybeSingle();

  if (existingError) throw existingError;

  const profile = existing as Profile | null;
  const role: AppRole = isAdminEmail(input.email) ? "admin" : profile?.role ?? "customer";

  const payload = {
    clerk_user_id: input.clerkUserId,
    email: input.email.toLowerCase(),
    full_name: input.fullName,
    avatar_url: input.avatarUrl,
    phone: input.phone,
    role
  };

  const query = profile
    ? supabase.from("profiles").update(payload).eq("id", profile.id).select("*").single()
    : supabase.from("profiles").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error) throw error;
  return data as Profile;
}

export async function deleteClerkProfile(clerkUserId: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("profiles").delete().eq("clerk_user_id", clerkUserId);
  if (error) throw error;
}
