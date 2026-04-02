const DEFAULT_AUTH_REDIRECT = "/dashboard";

export function getSafeCallbackUrl(
  callbackUrl: string | null | undefined,
  fallback: string = DEFAULT_AUTH_REDIRECT
): string {
  if (!callbackUrl) {
    return fallback;
  }

  const normalized = callbackUrl.trim();

  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return fallback;
  }

  return normalized;
}
