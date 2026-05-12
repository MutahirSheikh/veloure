import "server-only";

import { getSupabaseAdminClient } from "@/lib/db/admin";
import { isRecoverableSupabaseReadError, logSupabaseFallback } from "@/lib/db/errors";
import type { Address } from "@/lib/db/types";

export async function getAddresses(profileId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", profileId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    if (isRecoverableSupabaseReadError(error)) {
      logSupabaseFallback("getAddresses", error);
      return [];
    }
    throw error;
  }
  return (data ?? []) as Address[];
}
