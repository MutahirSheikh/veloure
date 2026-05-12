import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/lib/constants";
import { getSupabaseAdminClient } from "@/lib/db/admin";
import { isRecoverableSupabaseReadError, logSupabaseFallback } from "@/lib/db/errors";
import type { SiteSettings } from "@/lib/db/types";

const fallbackSiteSettings: SiteSettings = {
  id: 1,
  store_name: "Veloure",
  support_email: "support@example.com",
  contact_phone: "+1 555 0184",
  currency_code: "USD",
  currency_symbol: "$",
  flat_shipping_charge: 7,
  free_shipping_threshold: 150,
  cod_instructions: "Cash on delivery is available. Complete your database setup to enable full order processing.",
  admin_notification_emails: [],
  default_seo_title: "Veloure - Luxury Fashion and Lifestyle",
  default_seo_description: "Discover polished fashion, home, and lifestyle pieces from Veloure.",
  cart_alert_customer_enabled: false,
  cart_alert_admin_enabled: false,
  homepage_heading: "Elevate Your Everyday Rituals",
  homepage_subheading: "Fashion-forward lifestyle pieces with quiet texture, warm neutrals, and polished silhouettes.",
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString()
};

export async function getSiteSettings() {
  return unstable_cache(
    async () => {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) {
        if (isRecoverableSupabaseReadError(error)) {
          logSupabaseFallback("getSiteSettings", error);
          return fallbackSiteSettings;
        }
        throw error;
      }
      return data as SiteSettings;
    },
    ["site-settings"],
    { tags: [CACHE_TAGS.settings], revalidate: 300 }
  )();
}
