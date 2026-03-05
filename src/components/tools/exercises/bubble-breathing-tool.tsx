"use client";

import { useEffect, useRef, useState } from "react";
import {
  BREATHING_ACTIVE_STROKE,
  BREATHING_BASE_STROKE,
  BREATHING_STROKE_WIDTH,
  BreathingVisualFrame,
} from "@/components/tools/breathing-visual-frame";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const EXHALE_SECONDS = 4;
const CYCLE_SECONDS = INHALE_SECONDS + HOLD_SECONDS + EXHALE_SECONDS;
const INHALE_MS = INHALE_SECONDS * 1000;
const HOLD_MS = HOLD_SECONDS * 1000;
const EXHALE_MS = EXHALE_SECONDS * 1000;
const CYCLE_MS = CYCLE_SECONDS * 1000;
const MIN_SCALE = 1;
const MAX_SCALE = 1.45;
const GUIDE_RADIUS = 78;
const GUIDE_CIRCUMFERENCE = 2 * Math.PI * GUIDE_RADIUS;

function getPhase(msIntoCycle: number): { label: string; instruction: string; scale: number } {
  if (msIntoCycle < INHALE_MS) {
    const inhaleProgress = msIntoCycle / INHALE_MS;
    return {
      label: "Inhale",
      instruction: "Breathe in slowly through your nose.",
      scale: MIN_SCALE + (MAX_SCALE - MIN_SCALE) * inhaleProgress,
    };
  }

  if (msIntoCycle < INHALE_MS + HOLD_MS) {
    return {
      label: "Hold",
      instruction: "Keep your shoulders soft while you pause.",
      scale: MAX_SCALE,
    };
  }

  const exhaleProgress = (msIntoCycle - INHALE_MS - HOLD_MS) / EXHALE_MS;
  return {
    label: "Exhale",
    instruction: "Breathe out slowly through your mouth.",
    scale: MAX_SCALE - (MAX_SCALE - MIN_SCALE) * exhaleProgress,
  };
}

export default function BubbleBreathingTool({
  isRunning,
  isFinished,
  elapsedSeconds,
  durationSeconds,
  onStatusChange,
}: ToolRuntimeProps) {
  const targetDurationMs = Math.max(0, durationSeconds) * 1000;
  const [visualElapsedMs, setVisualElapsedMs] = useState(elapsedSeconds * 1000);
  const lastTickRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousElapsedRef = useRef(elapsedSeconds);

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (wasReset) {
      setVisualElapsedMs(0);
      lastTickRef.current = null;
      return;
    }

    setVisualElapsedMs((current) => Math.max(current, Math.min(elapsedSeconds * 1000, targetDurationMs)));
  }, [elapsedSeconds, targetDurationMs]);

  useEffect(() => {
    if (!isRunning) {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      lastTickRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = timestamp;
      }

      const deltaMs = timestamp - lastTickRef.current;
      lastTickRef.current = timestamp;

      setVisualElapsedMs((current) => Math.min(current + deltaMs, targetDurationMs));
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isRunning, targetDurationMs]);

  const cappedElapsedMs = Math.min(visualElapsedMs, targetDurationMs);
  const msIntoCycle = cappedElapsedMs % CYCLE_MS;
  const phase = getPhase(msIntoCycle);
  const completedCycles = Math.floor(cappedElapsedMs / CYCLE_MS);
  const cycleProgressPercent = Math.min(100, (msIntoCycle / CYCLE_MS) * 100);
  const totalCycles = Math.max(1, Math.floor(durationSeconds / CYCLE_SECONDS));
  const heading = isRunning ? phase.label : cappedElapsedMs === 0 ? "Ready" : "Paused";
  const instruction = isRunning
    ? phase.instruction
    : cappedElapsedMs === 0
      ? "Press start and match your breathing to the bubble."
      : "Paused";

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: phase.label,
      cycleLabel: `${Math.min(totalCycles, completedCycles + 1)} of ${totalCycles}`,
      cycleProgressPercent,
    });
  }, [completedCycles, cycleProgressPercent, onStatusChange, phase.label, totalCycles]);

  useEffect(() => {
    if (!isFinished) {
      return;
    }

    onStatusChange?.({
      phaseLabel: "Complete",
      cycleLabel: `${totalCycles} of ${totalCycles}`,
      cycleProgressPercent: 100,
    });
  }, [isFinished, onStatusChange, totalCycles]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Bubble pace</p>
        <p className="mt-1 text-base font-semibold text-dark">{heading}</p>
        <p className="mt-1 text-sm text-gray-700">{instruction}</p>
      </div>

      <BreathingVisualFrame visualClassName="p-4 sm:p-5">
        <div className="flex justify-center py-2">
          <svg
            viewBox="0 0 220 220"
            className="h-64 w-64"
            role="img"
            aria-label="Bubble breathing guide"
          >
            <defs>
              <radialGradient id="bubbleFillGradient" cx="50%" cy="40%" r="68%">
                <stop offset="0%" stopColor="rgba(134, 38, 51, 0.28)" />
                <stop offset="100%" stopColor="rgba(134, 38, 51, 0.56)" />
              </radialGradient>
            </defs>

            <circle
              cx="110"
              cy="110"
              r={GUIDE_RADIUS}
              fill="none"
              stroke={BREATHING_BASE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH}
              strokeLinecap="round"
            />
            <circle
              cx="110"
              cy="110"
              r={GUIDE_RADIUS}
              fill="none"
              stroke={BREATHING_ACTIVE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH + 0.5}
              strokeLinecap="round"
              strokeDasharray={GUIDE_CIRCUMFERENCE}
              strokeDashoffset={GUIDE_CIRCUMFERENCE * (1 - cycleProgressPercent / 100)}
              transform="rotate(-90 110 110)"
              style={{ filter: "drop-shadow(0 0 4px rgba(134, 38, 51, 0.35))" }}
            />
            <g transform={`translate(110 110) scale(${phase.scale}) translate(-110 -110)`}>
              <circle
                cx="110"
                cy="110"
                r="44"
                fill="url(#bubbleFillGradient)"
                stroke={BREATHING_ACTIVE_STROKE}
                strokeWidth={BREATHING_STROKE_WIDTH - 0.5}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(134, 38, 51, 0.3))" }}
              />
            </g>
          </svg>
        </div>
      </BreathingVisualFrame>

      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-primary-dark">
        <span>Cycles {completedCycles}</span>
        <span>Goal {totalCycles}</span>
      </div>
    </div>
  );
}
