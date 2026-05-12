import type { SiteSettings } from "@/lib/db/types";

export function formatMoney(
  value: number | string | null | undefined,
  settings?: Pick<SiteSettings, "currency_code" | "currency_symbol">
) {
  const amount = Number(value ?? 0);
  const currency = settings?.currency_code || "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return `${settings?.currency_symbol || "$"}${amount.toFixed(2)}`;
  }
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatShortDate(value: string | Date | null | undefined) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

export function humanizeStatus(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
