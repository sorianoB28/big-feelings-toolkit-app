"use client";

import {
  createContext,
  useEffect,
  useContext,
  useMemo,
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
    case "reset":
      return INITIAL_GUIDED_CHECKIN_STATE;
    default:
      return state;
  }
}

export function GuidedCheckInProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    guidedCheckInReducer,
    INITIAL_GUIDED_CHECKIN_STATE,
    (initialState) => {
      if (typeof window === "undefined") {
        return initialState;
      }

      const rawValue = window.sessionStorage.getItem(GUIDED_CHECKIN_STORAGE_KEY);

      if (!rawValue) {
        return initialState;
      }

      try {
        const parsed = JSON.parse(rawValue) as Partial<GuidedCheckInState>;

        return {
          ...initialState,
          ...parsed,
          bodyClueKeys: Array.isArray(parsed.bodyClueKeys) ? parsed.bodyClueKeys : [],
          selectedStrategyKeys: Array.isArray(parsed.selectedStrategyKeys)
            ? parsed.selectedStrategyKeys
            : [],
        };
      } catch {
        return initialState;
      }
    }
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(GUIDED_CHECKIN_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

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
