"use client";

import { useCallback, useMemo, useState } from "react";

export const RESET_METER_TOOL_POINTS = {
  breathing: 20,
  grounding: 30,
  movement: 25,
} as const;

const DEFAULT_MAX_POINTS = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

type UseResetMeterResult = {
  resetPoints: number;
  maxPoints: number;
  percentComplete: number;
  addPoints: (value: number) => void;
  resetMeter: () => void;
};

export function useResetMeter(
  initialPoints = 0,
  maxPoints = DEFAULT_MAX_POINTS
): UseResetMeterResult {
  const safeMaxPoints = maxPoints > 0 ? maxPoints : DEFAULT_MAX_POINTS;
  const [resetPoints, setResetPoints] = useState(() =>
    clamp(initialPoints, 0, safeMaxPoints)
  );

  const addPoints = useCallback(
    (value: number) => {
      if (!Number.isFinite(value) || value <= 0) {
        return;
      }

      setResetPoints((current) => clamp(current + value, 0, safeMaxPoints));
    },
    [safeMaxPoints]
  );

  const resetMeter = useCallback(() => {
    setResetPoints(0);
  }, []);

  const percentComplete = useMemo(() => {
    return Math.round((resetPoints / safeMaxPoints) * 100);
  }, [resetPoints, safeMaxPoints]);

  return {
    resetPoints,
    maxPoints: safeMaxPoints,
    percentComplete,
    addPoints,
    resetMeter,
  };
}
