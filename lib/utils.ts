import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ActionResult<T = undefined> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export function ok<T>(data: T, message?: string): ActionResult<T> {
  return { ok: true, data, message };
}

export function fail(error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      error?: unknown;
    };

    if (typeof maybeError.message === "string" && maybeError.message.trim()) {
      const details = typeof maybeError.details === "string" ? maybeError.details.trim() : "";
      const hint = typeof maybeError.hint === "string" ? maybeError.hint.trim() : "";
      return [maybeError.message.trim(), details || null, hint || null].filter(Boolean).join(" ");
    }

    if (typeof maybeError.error === "string" && maybeError.error.trim()) {
      return maybeError.error.trim();
    }
  }
  return "Something went wrong. Please try again.";
}

export function compact<T>(items: Array<T | null | undefined>) {
  return items.filter((item): item is T => item !== null && item !== undefined);
}

export function uniqueBy<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}
