export const APP_MODES = ["toolkit", "demo"] as const;

export type AppMode = (typeof APP_MODES)[number];

export const DEFAULT_APP_MODE: AppMode = "toolkit";
export const APP_MODE_STORAGE_KEY = "bft.appMode";
export const APP_MODE_COOKIE_KEY = "bft.appMode";

export function isAppMode(value: string | null | undefined): value is AppMode {
  return value === "toolkit" || value === "demo";
}
