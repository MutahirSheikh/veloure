import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { isAdminEmail } from "@/lib/auth/admin-emails";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { isRecoverableSupabaseReadError, logSupabaseFallback } from "@/lib/db/errors";
import type { AppRole, Profile } from "@/lib/db/types";

type ClerkProfileInput = {
  clerkUserId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  phone: string | null;
};

function getPrimaryEmailFromUser(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) return null;
  const primary = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId);
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null;
}

function getPrimaryPhoneFromUser(user: Awaited<ReturnType<typeof currentUser>>) {
  if (!user) return null;
  const primary = user.phoneNumbers.find((phone) => phone.id === user.primaryPhoneNumberId);
  return primary?.phoneNumber ?? user.phoneNumbers[0]?.phoneNumber ?? null;
}

function buildFallbackProfile(input: ClerkProfileInput): Profile {
  return {
    id: `local-${input.clerkUserId}`,
    clerk_user_id: input.clerkUserId,
    email: input.email.toLowerCase(),
    full_name: input.fullName,
    avatar_url: input.avatarUrl,
    phone: input.phone,
    role: isAdminEmail(input.email) ? "admin" : "customer",
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString()
  };
}

export async function upsertProfileFromClerk(input: ClerkProfileInput) {
  const supabase = getSupabaseAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("*")
    .or(`clerk_user_id.eq.${input.clerkUserId},email.eq.${input.email}`)
    .maybeSingle();

  if (existingError) {
    if (isRecoverableSupabaseReadError(existingError)) {
      logSupabaseFallback("upsertProfileFromClerk", existingError);
      return buildFallbackProfile(input);
    }
    throw existingError;
  }

  const existingProfile = existing as Profile | null;
  const bootstrappedRole: AppRole = isAdminEmail(input.email) ? "admin" : "customer";
  const role: AppRole = bootstrappedRole === "admin" ? "admin" : existingProfile?.role ?? "customer";

  const payload = {
    clerk_user_id: input.clerkUserId,
    email: input.email.toLowerCase(),
    full_name: input.fullName,
    avatar_url: input.avatarUrl,
    phone: input.phone,
    role
  };

  const query = existingProfile
    ? supabase.from("profiles").update(payload).eq("id", existingProfile.id).select("*").single()
    : supabase.from("profiles").insert(payload).select("*").single();

  const { data, error } = await query;
  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("upsertProfileFromClerk", error);
      return buildFallbackProfile(input);
    }
    throw error;
  }
  return data as Profile;
}

export async function ensureProfile() {
  const user = await currentUser();
  if (!user) return null;

  const email = getPrimaryEmailFromUser(user);
  if (!email) {
    throw new Error("Your account needs a primary email address before using Veloure.");
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || null;

  return upsertProfileFromClerk({
    clerkUserId: user.id,
    email,
    fullName,
    avatarUrl: user.imageUrl ?? null,
    phone: getPrimaryPhoneFromUser(user)
  });
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_user_id", userId)
    .maybeSingle();

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getCurrentProfile", error);
      return ensureProfile();
    }
    throw error;
  }
  if (data) {
    const profile = data as Profile;

    if (profile.role !== "admin" && isAdminEmail(profile.email)) {
      const { data: updatedProfile, error: updateError } = await supabase
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", profile.id)
        .select("*")
        .single();

      if (updateError) {
        if (isRecoverableSupabaseReadError(updateError)) {
          logSupabaseFallback("getCurrentProfile", updateError);
          const elevatedProfile: Profile = { ...profile, role: "admin" };
          return elevatedProfile;
        }
        throw updateError;
      }

      return updatedProfile as Profile;
    }

    return profile;
  }

  return ensureProfile();
}

export async function requireUserProfile() {
  const profile = await getCurrentProfile();
  if (!profile) {
    throw new Error("You must be signed in to continue.");
  }
  return profile;
}

export async function requireAdminProfile() {
  const profile = await requireUserProfile();
  if (profile.role !== "admin") {
    throw new Error("You do not have permission to access this area.");
  }
  return profile;
}
