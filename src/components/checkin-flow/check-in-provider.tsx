"use client";

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  useReducer,
  type PropsWithChildren,
} from "react";
import type { CheckinFeelingKey, CheckinStrategyKey, CheckinZoneKey } from "@/lib/checkin";
import {
  INITIAL_GUIDED_CHECKIN_STATE,
  type GuidedCheckInState,
  type GuidedCheckInViewer,
} from "@/lib/checkin";
import { GUIDED_CHECKIN_STORAGE_KEY } from "@/lib/checkin/guided-checkin-storage";

type GuidedCheckInAction =
  | { type: "set-session-key"; sessionKey: string }
  | { type: "set-profile"; profileId: string | null; profileName: string | null }
  | { type: "set-zone"; zoneKey: CheckinZoneKey | null }
  | { type: "set-feeling"; feelingKey: CheckinFeelingKey | null }
  | { type: "set-feeling-detail"; detailKey: string | null; detailLabel: string | null }
  | { type: "set-intensity"; intensity: number | null }
  | { type: "set-notes"; notes: string | null }
  | { type: "toggle-body-clue"; bodyClueKey: string }
  | { type: "set-tool"; toolKey: string | null }
  | { type: "toggle-strategy"; strategyKey: CheckinStrategyKey }
  | { type: "mark-completed"; completedAt: string | null }
  | { type: "mark-persisted"; checkinId: string | null }
  | { type: "hydrate"; snapshot: Partial<GuidedCheckInState> }
  | { type: "reset" };

type GuidedCheckInContextValue = {
  viewer: GuidedCheckInViewer;
  state: GuidedCheckInState;
  hasHydrated: boolean;
  setProfile: (profileId: string | null, profileName: string | null) => void;
  setZone: (zoneKey: CheckinZoneKey | null) => void;
  setFeeling: (feelingKey: CheckinFeelingKey | null) => void;
  setFeelingDetail: (detailKey: string | null, detailLabel: string | null) => void;
  setIntensity: (intensity: number | null) => void;
  setNotes: (notes: string | null) => void;
  toggleBodyClue: (bodyClueKey: string) => void;
  setTool: (toolKey: string | null) => void;
  toggleStrategy: (strategyKey: CheckinStrategyKey) => void;
  markCompleted: (completedAt: string | null) => void;
  markPersistedCheckin: (checkinId: string | null) => void;
  reset: () => void;
};

const GuidedCheckInContext = createContext<GuidedCheckInContextValue | null>(null);

type GuidedCheckInProviderProps = PropsWithChildren<{
  initialViewer: GuidedCheckInViewer;
}>;

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function createSessionKey(): string {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `guided-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mergeGuidedCheckInState(snapshot: Partial<GuidedCheckInState>): GuidedCheckInState {
  return {
    ...INITIAL_GUIDED_CHECKIN_STATE,
    sessionKey: typeof snapshot.sessionKey === "string" ? snapshot.sessionKey : createSessionKey(),
    ...snapshot,
    startedAt: typeof snapshot.startedAt === "string" ? snapshot.startedAt : null,
    intensity:
      typeof snapshot.intensity === "number" &&
      Number.isFinite(snapshot.intensity) &&
      snapshot.intensity >= 1 &&
      snapshot.intensity <= 10
        ? snapshot.intensity
        : null,
    notes: typeof snapshot.notes === "string" ? snapshot.notes : null,
    bodyClueKeys: Array.isArray(snapshot.bodyClueKeys) ? snapshot.bodyClueKeys : [],
    selectedToolWasSkipped: snapshot.selectedToolWasSkipped === true,
    selectedToolProgressPercent:
      typeof snapshot.selectedToolProgressPercent === "number" &&
      Number.isFinite(snapshot.selectedToolProgressPercent)
        ? Math.max(0, Math.min(100, Math.round(snapshot.selectedToolProgressPercent)))
        : null,
    selectedStrategyKeys: Array.isArray(snapshot.selectedStrategyKeys)
      ? snapshot.selectedStrategyKeys
      : [],
    profileId: typeof snapshot.profileId === "string" ? snapshot.profileId : null,
    profileName: typeof snapshot.profileName === "string" ? snapshot.profileName : null,
    completed: snapshot.completed === true,
    completedAt: typeof snapshot.completedAt === "string" ? snapshot.completedAt : null,
    persistedCheckinId:
      typeof snapshot.persistedCheckinId === "string" ? snapshot.persistedCheckinId : null,
  };
}

function clearPersistedCheckin(state: GuidedCheckInState): GuidedCheckInState {
  if (!state.persistedCheckinId && !state.completed && !state.completedAt) {
    return state;
  }

  return {
    ...state,
    completed: false,
    completedAt: null,
    persistedCheckinId: null,
  };
}

function ensureStartedAt(state: GuidedCheckInState): string {
  return state.startedAt ?? new Date().toISOString();
}

function ensureSessionKey(state: GuidedCheckInState): string {
  return state.sessionKey ?? createSessionKey();
}

function guidedCheckInReducer(
  state: GuidedCheckInState,
  action: GuidedCheckInAction
): GuidedCheckInState {
  switch (action.type) {
    case "set-session-key":
      return {
        ...state,
        sessionKey: action.sessionKey,
      };
    case "set-profile":
      return {
        ...INITIAL_GUIDED_CHECKIN_STATE,
        sessionKey: createSessionKey(),
        profileId: action.profileId,
        profileName: action.profileName,
      };
    case "set-zone":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        zoneKey: action.zoneKey,
        intensity: state.intensity,
        notes: state.notes,
        feelingKey: null,
        feelingDetailKey: null,
        feelingDetailLabel: null,
        bodyClueKeys: [],
        selectedToolKey: null,
        selectedToolWasSkipped: false,
        selectedToolProgressPercent: null,
        selectedStrategyKeys: [],
      };
    case "set-feeling":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        feelingKey: action.feelingKey,
        feelingDetailKey: null,
        feelingDetailLabel: null,
        bodyClueKeys: [],
        selectedToolKey: null,
        selectedToolWasSkipped: false,
        selectedToolProgressPercent: null,
        selectedStrategyKeys: [],
      };
    case "set-feeling-detail":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        feelingDetailKey: action.detailKey,
        feelingDetailLabel: action.detailLabel,
        bodyClueKeys: [],
        selectedToolKey: null,
        selectedToolWasSkipped: false,
        selectedToolProgressPercent: null,
        selectedStrategyKeys: [],
      };
    case "set-intensity":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        intensity: action.intensity,
      };
    case "set-notes":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        notes: action.notes,
      };
    case "toggle-body-clue":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        bodyClueKeys: toggleValue(state.bodyClueKeys, action.bodyClueKey),
      };
    case "set-tool":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        selectedToolKey: action.toolKey,
        selectedToolWasSkipped: false,
        selectedToolProgressPercent: null,
      };
    case "toggle-strategy":
      return {
        ...clearPersistedCheckin(state),
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        selectedStrategyKeys: toggleValue(state.selectedStrategyKeys, action.strategyKey),
      };
    case "mark-completed":
      return {
        ...state,
        sessionKey: ensureSessionKey(state),
        startedAt: ensureStartedAt(state),
        completed: Boolean(action.completedAt),
        completedAt: action.completedAt,
      };
    case "mark-persisted":
      return {
        ...state,
        persistedCheckinId: action.checkinId,
      };
    case "hydrate":
      return mergeGuidedCheckInState(action.snapshot);
    case "reset":
      return {
        ...INITIAL_GUIDED_CHECKIN_STATE,
        sessionKey: createSessionKey(),
        profileId: state.profileId,
        profileName: state.profileName,
      };
    default:
      return state;
  }
}

export function GuidedCheckInProvider({ children, initialViewer }: GuidedCheckInProviderProps) {
  const [state, dispatch] = useReducer(guidedCheckInReducer, INITIAL_GUIDED_CHECKIN_STATE);
  const [hasHydratedFromStorage, setHasHydratedFromStorage] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setHasHydratedFromStorage(true);
      return;
    }

    try {
      const rawValue = window.sessionStorage.getItem(GUIDED_CHECKIN_STORAGE_KEY);

      if (rawValue) {
        const parsed = JSON.parse(rawValue) as Partial<GuidedCheckInState>;
        dispatch({ type: "hydrate", snapshot: parsed });
      }
    } catch {
      // Ignore malformed or inaccessible storage so first render stays stable.
    } finally {
      setHasHydratedFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedFromStorage || state.sessionKey) {
      return;
    }

    dispatch({ type: "set-session-key", sessionKey: createSessionKey() });
  }, [hasHydratedFromStorage, state.sessionKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydratedFromStorage) {
      return;
    }

    try {
      window.sessionStorage.setItem(GUIDED_CHECKIN_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write failures so the public flow still works.
    }
  }, [hasHydratedFromStorage, state]);

  useEffect(() => {
    if (!initialViewer.isAuthenticated) {
      if (state.profileId || state.profileName) {
        dispatch({ type: "set-profile", profileId: null, profileName: null });
      }

      return;
    }

    if (!state.profileId) {
      return;
    }

    const matchingProfile = initialViewer.availableProfiles.find((profile) => profile.id === state.profileId);

    if (!matchingProfile) {
      dispatch({ type: "set-profile", profileId: null, profileName: null });
    }
  }, [
    initialViewer.availableProfiles,
    initialViewer.isAuthenticated,
    state.profileId,
    state.profileName,
  ]);

  const value = useMemo<GuidedCheckInContextValue>(
    () => ({
      viewer: initialViewer,
      state,
      hasHydrated: hasHydratedFromStorage,
      setProfile: (profileId, profileName) =>
        dispatch({ type: "set-profile", profileId, profileName }),
      setZone: (zoneKey) => dispatch({ type: "set-zone", zoneKey }),
      setFeeling: (feelingKey) => dispatch({ type: "set-feeling", feelingKey }),
      setFeelingDetail: (detailKey, detailLabel) =>
        dispatch({ type: "set-feeling-detail", detailKey, detailLabel }),
      setIntensity: (intensity) => dispatch({ type: "set-intensity", intensity }),
      setNotes: (notes) => dispatch({ type: "set-notes", notes }),
      toggleBodyClue: (bodyClueKey) => dispatch({ type: "toggle-body-clue", bodyClueKey }),
      setTool: (toolKey) => dispatch({ type: "set-tool", toolKey }),
      toggleStrategy: (strategyKey) => dispatch({ type: "toggle-strategy", strategyKey }),
      markCompleted: (completedAt) => dispatch({ type: "mark-completed", completedAt }),
      markPersistedCheckin: (checkinId) => dispatch({ type: "mark-persisted", checkinId }),
      reset: () => dispatch({ type: "reset" }),
    }),
    [hasHydratedFromStorage, initialViewer, state]
  );

  return <GuidedCheckInContext.Provider value={value}>{children}</GuidedCheckInContext.Provider>;
}

export function useGuidedCheckIn() {
  const context = useContext(GuidedCheckInContext);

  if (!context) {
    throw new Error("useGuidedCheckIn must be used within GuidedCheckInProvider.");
  }

  return context;
}
