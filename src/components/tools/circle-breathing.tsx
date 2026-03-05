"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BREATHING_ACTIVE_STROKE,
  BREATHING_BASE_STROKE,
  BREATHING_STROKE_WIDTH,
  BreathingVisualFrame,
} from "@/components/tools/breathing-visual-frame";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const INHALE_SECONDS = 4;
const HOLD_SECONDS = 2;
const EXHALE_SECONDS = 6;
const TOTAL_CYCLES = 6;
const MAX_SECONDS = 120;

const INHALE_MS = INHALE_SECONDS * 1000;
const HOLD_MS = HOLD_SECONDS * 1000;
const EXHALE_MS = EXHALE_SECONDS * 1000;
const cycleDurationMs = INHALE_MS + HOLD_MS + EXHALE_MS;
const MAX_SCALE = 1.12;
const MIN_SCALE = 0.72;
const GUIDE_RADIUS = 78;
const GUIDE_CIRCUMFERENCE = 2 * Math.PI * GUIDE_RADIUS;

type BreathPhase = "Breathe in" | "Hold" | "Breathe out";

function getPhaseAndScale(msIntoCycle: number): { phase: BreathPhase; scale: number } {
  if (msIntoCycle < INHALE_MS) {
    const progress = msIntoCycle / INHALE_MS;
    return {
      phase: "Breathe in",
      scale: MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress,
    };
  }

  if (msIntoCycle < INHALE_MS + HOLD_MS) {
    return {
      phase: "Hold",
      scale: MAX_SCALE,
    };
  }

  const exhaleProgress = (msIntoCycle - INHALE_MS - HOLD_MS) / EXHALE_MS;
  return {
    phase: "Breathe out",
    scale: MAX_SCALE - (MAX_SCALE - MIN_SCALE) * exhaleProgress,
  };
}

export default function CircleBreathing({
  isRunning,
  isFinished,
  elapsedSeconds,
  durationSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const [visualElapsedMs, setVisualElapsedMs] = useState(elapsedSeconds * 1000);
  const lastTickRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousElapsedRef = useRef(elapsedSeconds);

  const maxDurationMs = Math.min(durationSeconds, MAX_SECONDS) * 1000;
  const targetDurationMs = Math.min(maxDurationMs, TOTAL_CYCLES * cycleDurationMs);

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
    if (!isRunning || isFinished) {
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
  }, [isFinished, isRunning, targetDurationMs]);

  const cappedElapsedMs = Math.min(visualElapsedMs, targetDurationMs);
  const completedCycles = Math.min(TOTAL_CYCLES, Math.floor(cappedElapsedMs / cycleDurationMs));
  const currentCycleIndex = Math.min(TOTAL_CYCLES - 1, Math.floor(cappedElapsedMs / cycleDurationMs));
  const cycleElapsedMs = cappedElapsedMs % cycleDurationMs;
  const cycleProgress = cycleElapsedMs / cycleDurationMs;
  const cycleProgressPercent = Math.min(100, Math.max(0, cycleProgress * 100));

  useEffect(() => {
    if (isFinished) {
      return;
    }

    if (completedCycles >= TOTAL_CYCLES || cappedElapsedMs >= targetDurationMs) {
      onFinish();
    }
  }, [cappedElapsedMs, completedCycles, isFinished, onFinish, targetDurationMs]);

  const { phase, scale } = useMemo(() => {
    if (isFinished) {
      return { phase: "Hold" as BreathPhase, scale: MIN_SCALE };
    }

    return getPhaseAndScale(cycleElapsedMs);
  }, [cycleElapsedMs, isFinished]);

  const instruction = useMemo(() => {
    if (isFinished) {
      return "Complete";
    }
    if (!isRunning && cappedElapsedMs === 0) {
      return "Press Start";
    }
    if (!isRunning) {
      return "Paused";
    }
    return phase;
  }, [cappedElapsedMs, isFinished, isRunning, phase]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: phase,
      cycleLabel: `${currentCycleIndex + 1} of ${TOTAL_CYCLES}`,
      cycleProgressPercent,
    });
  }, [currentCycleIndex, cycleProgressPercent, onStatusChange, phase]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Circle breathing</p>
        <p className="mt-1 text-lg font-semibold text-dark">{instruction}</p>
        <p className="mt-1 text-sm text-gray-700">Inhale 4s, hold 2s, exhale 6s.</p>
      </div>

      <BreathingVisualFrame visualClassName="p-4 sm:p-5">
        <div className="flex min-h-72 items-center justify-center">
          <svg
            viewBox="0 0 220 220"
            className="h-64 w-64"
            role="img"
            aria-label="Circle breathing guide"
          >
            <defs>
              <radialGradient id="circleFillGradient" cx="50%" cy="45%" r="65%">
                <stop offset="0%" stopColor="rgba(134, 38, 51, 0.32)" />
                <stop offset="100%" stopColor="rgba(134, 38, 51, 0.58)" />
              </radialGradient>
            </defs>

            <circle
              cx="110"
              cy="110"
              r={GUIDE_RADIUS}
              fill="none"
              stroke={BREATHING_BASE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH}
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
              strokeDashoffset={GUIDE_CIRCUMFERENCE * (1 - cycleProgress)}
              transform="rotate(-90 110 110)"
              style={{ filter: "drop-shadow(0 0 4px rgba(134, 38, 51, 0.35))" }}
            />
            <g transform={`translate(110 110) scale(${scale}) translate(-110 -110)`}>
              <circle
                cx="110"
                cy="110"
                r="56"
                fill="url(#circleFillGradient)"
                stroke={BREATHING_ACTIVE_STROKE}
                strokeWidth={BREATHING_STROKE_WIDTH - 0.5}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px rgba(134, 38, 51, 0.28))" }}
              />
            </g>
          </svg>
        </div>
      </BreathingVisualFrame>
    </div>
  );
}
