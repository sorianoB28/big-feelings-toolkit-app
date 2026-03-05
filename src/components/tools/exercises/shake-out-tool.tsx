"use client";

import { useEffect } from "react";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const SHAKE_SECONDS = 6;
const STILL_SECONDS = 4;
const ROUND_SECONDS = SHAKE_SECONDS + STILL_SECONDS;

export default function ShakeOutTool({
  isRunning,
  elapsedSeconds,
  durationSeconds,
  onStatusChange,
}: ToolRuntimeProps) {
  const cyclePoint = elapsedSeconds % ROUND_SECONDS;
  const inShakePhase = cyclePoint < SHAKE_SECONDS;
  const phaseLabel = inShakePhase ? "Shake out" : "Still breath";
  const phaseSecondsLeft = inShakePhase
    ? SHAKE_SECONDS - cyclePoint
    : ROUND_SECONDS - cyclePoint;
  const totalRounds = Math.max(1, Math.ceil(durationSeconds / ROUND_SECONDS));
  const cycleLabel = `${Math.min(totalRounds, Math.floor(elapsedSeconds / ROUND_SECONDS) + 1)} of ${totalRounds}`;
  const cycleProgressPercent = Math.min(100, (cyclePoint / ROUND_SECONDS) * 100);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel,
      cycleLabel,
      cycleProgressPercent,
    });
  }, [cycleLabel, cycleProgressPercent, onStatusChange, phaseLabel]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Move and reset</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning ? `${phaseLabel} for ${phaseSecondsLeft}s` : "Press start when you are ready to move."}
        </p>
      </div>

      <div className="rounded-lg border border-border-soft bg-surface p-4">
        <p className="text-sm text-gray-700">
          Shake hands, arms, and legs for 6 seconds, then pause for 4 seconds and take one deep breath.
        </p>
      </div>
    </div>
  );
}

