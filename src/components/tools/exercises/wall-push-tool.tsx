"use client";

import { useEffect, useState } from "react";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const PUSH_PHASE_SECONDS = 5;
const RELEASE_PHASE_SECONDS = 5;
const ROUND_SECONDS = PUSH_PHASE_SECONDS + RELEASE_PHASE_SECONDS;

export default function WallPushTool({
  isRunning,
  elapsedSeconds,
  durationSeconds,
  isFinished,
  onStatusChange,
}: ToolRuntimeProps) {
  const [reps, setReps] = useState(0);

  const cyclePoint = elapsedSeconds % ROUND_SECONDS;
  const isPushPhase = cyclePoint < PUSH_PHASE_SECONDS;
  const phaseLabel = isPushPhase ? "Push" : "Release";
  const phaseSecondsLeft = isPushPhase
    ? PUSH_PHASE_SECONDS - cyclePoint
    : ROUND_SECONDS - cyclePoint;
  const suggestedRounds = Math.max(1, Math.floor(durationSeconds / ROUND_SECONDS));
  const completedRounds = Math.floor(elapsedSeconds / ROUND_SECONDS);
  const cycleProgressPercent = Math.min(100, (cyclePoint / ROUND_SECONDS) * 100);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel,
      cycleLabel: `${Math.min(suggestedRounds, completedRounds + 1)} of ${suggestedRounds}`,
      cycleProgressPercent,
    });
  }, [completedRounds, cycleProgressPercent, onStatusChange, phaseLabel, suggestedRounds]);

  useEffect(() => {
    if (!isFinished) {
      return;
    }

    onStatusChange?.({
      phaseLabel: "Complete",
      cycleLabel: `${suggestedRounds} of ${suggestedRounds}`,
      cycleProgressPercent: 100,
    });
  }, [isFinished, onStatusChange, suggestedRounds]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Body reset</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning ? `${phaseLabel} for ${phaseSecondsLeft}s` : "Place hands on a wall at shoulder height."}
        </p>
        <p className="mt-1 text-sm text-gray-700">
          Push firmly for 5 seconds, release for 5 seconds, and repeat.
        </p>
      </div>

      <div className="rounded-lg border border-border-soft bg-surface p-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">Repetition tracker</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-2xl font-semibold text-dark">{reps}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setReps((current) => current + 1)}
              className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
            >
              +1 rep
            </button>
            <button
              type="button"
              onClick={() => setReps(0)}
              className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs uppercase tracking-wide text-primary-dark">
        Suggested rounds {suggestedRounds}
      </p>
    </div>
  );
}
