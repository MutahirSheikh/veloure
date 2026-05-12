type SupabaseLikeError = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

const SCHEMA_NOT_READY_CODES = new Set(["PGRST202", "PGRST205", "42P01", "42883"]);
const PERMISSION_ERROR_CODES = new Set(["42501"]);
const NETWORK_ERROR_PATTERNS = [
  "TypeError: fetch failed",
  "UND_ERR_CONNECT_TIMEOUT",
  "Connect Timeout Error",
  "getaddrinfo ENOTFOUND",
  "ECONNREFUSED",
  "ETIMEDOUT"
];

export function isSchemaNotReadyError(error: unknown): error is SupabaseLikeError {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? (error.code as string | null | undefined) : undefined;
  return typeof code === "string" && SCHEMA_NOT_READY_CODES.has(code);
}

export function isSupabasePermissionError(error: unknown): error is SupabaseLikeError {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? (error.code as string | null | undefined) : undefined;
  return typeof code === "string" && PERMISSION_ERROR_CODES.has(code);
}

export function isSupabaseNetworkError(error: unknown): error is SupabaseLikeError {
  if (!error || typeof error !== "object") return false;
  const message = [
    "message" in error ? error.message : "",
    "details" in error ? error.details : "",
    "hint" in error ? error.hint : ""
  ]
    .filter(Boolean)
    .join(" ");

  return NETWORK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
}

export function isRecoverableSupabaseReadError(error: unknown) {
  return isSchemaNotReadyError(error) || isSupabaseNetworkError(error) || isSupabasePermissionError(error);
}

export function logSupabaseFallback(scope: string, error: unknown) {
  const reason = isSchemaNotReadyError(error)
    ? "schema is not ready"
    : isSupabasePermissionError(error)
      ? "the Supabase key cannot bypass row-level security"
      : "Supabase is unavailable";
  console.warn(`[veloure] Falling back in ${scope} because ${reason}.`, error);
}
