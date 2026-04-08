import type { GuidedCheckInState } from "./flow";

export const GUIDED_CHECKIN_STORAGE_KEY = "bft.guided-checkin.state";

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readGuidedCheckInStorage(): Partial<GuidedCheckInState> | null {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  try {
    const rawValue = storage.getItem(GUIDED_CHECKIN_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as Partial<GuidedCheckInState>;
  } catch {
    return null;
  }
}

export function patchGuidedCheckInStorage(
  patch: Partial<GuidedCheckInState>
): Partial<GuidedCheckInState> | null {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  try {
    const currentValue = readGuidedCheckInStorage() ?? {};
    const nextValue = {
      ...currentValue,
      ...patch,
    };

    storage.setItem(GUIDED_CHECKIN_STORAGE_KEY, JSON.stringify(nextValue));
    return nextValue;
  } catch {
    return null;
  }
}
