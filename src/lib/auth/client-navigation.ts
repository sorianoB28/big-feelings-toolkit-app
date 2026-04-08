"use client";

export function normalizeAuthNavigationUrl(
  nextUrl: string | null | undefined,
  fallbackPath: string = "/auth"
): string {
  if (typeof window === "undefined") {
    return nextUrl && nextUrl.trim().length > 0 ? nextUrl : fallbackPath;
  }

  const origin = window.location.origin;
  const fallbackUrl = new URL(fallbackPath, origin);

  if (!nextUrl || nextUrl.trim().length === 0) {
    return fallbackUrl.toString();
  }

  try {
    const parsedUrl = new URL(nextUrl, origin);
    return `${origin}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return fallbackUrl.toString();
  }
}
