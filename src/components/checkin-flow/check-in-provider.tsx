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
import { INITIAL_GUIDED_CHECKIN_STATE, type GuidedCheckInState } from "@/lib/checkin";

const GUIDED_CHECKIN_STORAGE_KEY = "bft.guided-checkin.state";

type GuidedCheckInAction =
  | { type: "set-zone"; zoneKey: CheckinZoneKey | null }
  | { type: "set-feeling"; feelingKey: CheckinFeelingKey | null }
  | { type: "set-feeling-detail"; detailKey: string | null; detailLabel: string | null }
  | { type: "toggle-body-clue"; bodyClueKey: string }
  | { type: "set-tool"; toolKey: string | null }
  | { type: "toggle-strategy"; strategyKey: CheckinStrategyKey }
  | { type: "hydrate"; snapshot: Partial<GuidedCheckInState> }
  | { type: "reset" };

type GuidedCheckInContextValue = {
  state: GuidedCheckInState;
  setZone: (zoneKey: CheckinZoneKey | null) => void;
  setFeeling: (feelingKey: CheckinFeelingKey | null) => void;
  setFeelingDetail: (detailKey: string | null, detailLabel: string | null) => void;
  toggleBodyClue: (bodyClueKey: string) => void;
  setTool: (toolKey: string | null) => void;
  toggleStrategy: (strategyKey: CheckinStrategyKey) => void;
  reset: () => void;
};

const GuidedCheckInContext = createContext<GuidedCheckInContextValue | null>(null);

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function mergeGuidedCheckInState(snapshot: Partial<GuidedCheckInState>): GuidedCheckInState {
  return {
    ...INITIAL_GUIDED_CHECKIN_STATE,
    ...snapshot,
    bodyClueKeys: Array.isArray(snapshot.bodyClueKeys) ? snapshot.bodyClueKeys : [],
    selectedStrategyKeys: Array.isArray(snapshot.selectedStrategyKeys)
      ? snapshot.selectedStrategyKeys
      : [],
  };
}

function guidedCheckInReducer(
  state: GuidedCheckInState,
  action: GuidedCheckInAction
): GuidedCheckInState {
  switch (action.type) {
    case "set-zone":
      return {
        ...state,
        zoneKey: action.zoneKey,
        feelingKey: null,
        feelingDetailKey: null,
        feelingDetailLabel: null,
        bodyClueKeys: [],
        selectedToolKey: null,
        selectedStrategyKeys: [],
      };
    case "set-feeling":
      return {
        ...state,
        feelingKey: action.feelingKey,
        feelingDetailKey: null,
        feelingDetailLabel: null,
        bodyClueKeys: [],
        selectedToolKey: null,
        selectedStrategyKeys: [],
      };
    case "set-feeling-detail":
      return {
        ...state,
        feelingDetailKey: action.detailKey,
        feelingDetailLabel: action.detailLabel,
        bodyClueKeys: [],
        selectedToolKey: null,
        selectedStrategyKeys: [],
      };
    case "toggle-body-clue":
      return {
        ...state,
        bodyClueKeys: toggleValue(state.bodyClueKeys, action.bodyClueKey),
      };
    case "set-tool":
      return {
        ...state,
        selectedToolKey: action.toolKey,
      };
    case "toggle-strategy":
      return {
        ...state,
        selectedStrategyKeys: toggleValue(state.selectedStrategyKeys, action.strategyKey),
      };
    case "hydrate":
      return mergeGuidedCheckInState(action.snapshot);
    case "reset":
      return INITIAL_GUIDED_CHECKIN_STATE;
    default:
      return state;
  }
}

export function GuidedCheckInProvider({ children }: PropsWithChildren) {
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
    if (typeof window === "undefined" || !hasHydratedFromStorage) {
      return;
    }

    try {
      window.sessionStorage.setItem(GUIDED_CHECKIN_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage write failures so the public flow still works.
    }
  }, [hasHydratedFromStorage, state]);

  const value = useMemo<GuidedCheckInContextValue>(
    () => ({
      state,
      setZone: (zoneKey) => dispatch({ type: "set-zone", zoneKey }),
      setFeeling: (feelingKey) => dispatch({ type: "set-feeling", feelingKey }),
      setFeelingDetail: (detailKey, detailLabel) =>
        dispatch({ type: "set-feeling-detail", detailKey, detailLabel }),
      toggleBodyClue: (bodyClueKey) => dispatch({ type: "toggle-body-clue", bodyClueKey }),
      setTool: (toolKey) => dispatch({ type: "set-tool", toolKey }),
      toggleStrategy: (strategyKey) => dispatch({ type: "toggle-strategy", strategyKey }),
      reset: () => dispatch({ type: "reset" }),
    }),
    [state]
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
