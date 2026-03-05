"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BREATHING_ACTIVE_STROKE,
  BREATHING_BASE_STROKE,
  BREATHING_STROKE_WIDTH,
  BreathingVisualFrame,
} from "@/components/tools/breathing-visual-frame";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const PHASE_SECONDS = 4;
const PHASE_MS = PHASE_SECONDS * 1000;
const PHASES_PER_CYCLE = 4;
const CYCLE_MS = PHASE_MS * PHASES_PER_CYCLE;
const TOTAL_CYCLES = 6;
const MAX_SECONDS = 120;

const PHASES = [
  { instruction: "Breathe in", start: { x: 18, y: 18 }, end: { x: 82, y: 18 } },
  { instruction: "Hold", start: { x: 82, y: 18 }, end: { x: 82, y: 82 } },
  { instruction: "Breathe out", start: { x: 82, y: 82 }, end: { x: 18, y: 82 } },
  { instruction: "Hold", start: { x: 18, y: 82 }, end: { x: 18, y: 18 } },
] as const;

function getPhaseCountdown(msIntoPhase: number): number {
  // Keep a subtle 3..2..1 pulse across each 4-second phase.
  return Math.max(1, Math.ceil((PHASE_MS - msIntoPhase - 1000) / 1000));
}

export default function BoxBreathing({
  isRunning,
  elapsedSeconds,
  isFinished,
  durationSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const [visualElapsedMs, setVisualElapsedMs] = useState(elapsedSeconds * 1000);
  const lastTickRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousElapsedRef = useRef(elapsedSeconds);

  const maxDurationMs = Math.min(durationSeconds, MAX_SECONDS) * 1000;
  const targetDurationMs = Math.min(maxDurationMs, TOTAL_CYCLES * CYCLE_MS);

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
  const completedCycles = Math.min(TOTAL_CYCLES, Math.floor(cappedElapsedMs / CYCLE_MS));
  const msIntoCycle = cappedElapsedMs % CYCLE_MS;
  const phaseIndex = Math.min(PHASES_PER_CYCLE - 1, Math.floor(msIntoCycle / PHASE_MS));
  const msIntoPhase = msIntoCycle % PHASE_MS;
  const rawPhaseProgress = msIntoPhase / PHASE_MS;
  const phaseProgress =
    completedCycles >= TOTAL_CYCLES
      ? 1
      : rawPhaseProgress === 0 && cappedElapsedMs > 0
        ? 1
        : rawPhaseProgress;
  const countdown = getPhaseCountdown(msIntoPhase);
  const currentPhase = PHASES[phaseIndex];
  const lineEndX = currentPhase.start.x + (currentPhase.end.x - currentPhase.start.x) * phaseProgress;
  const lineEndY = currentPhase.start.y + (currentPhase.end.y - currentPhase.start.y) * phaseProgress;
  const cycleProgressPercent = Math.min(100, (msIntoCycle / CYCLE_MS) * 100);

  useEffect(() => {
    if (isFinished) {
      return;
    }

    if (completedCycles >= TOTAL_CYCLES || cappedElapsedMs >= targetDurationMs) {
      onFinish();
    }
  }, [cappedElapsedMs, completedCycles, isFinished, onFinish, targetDurationMs]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: currentPhase.instruction,
      cycleLabel: `${Math.min(TOTAL_CYCLES, completedCycles + 1)} of ${TOTAL_CYCLES}`,
      cycleProgressPercent,
    });
  }, [completedCycles, currentPhase.instruction, cycleProgressPercent, onStatusChange]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

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
    return currentPhase.instruction;
  }, [cappedElapsedMs, currentPhase.instruction, isFinished, isRunning]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Box breathing</p>
        <p className="mt-1 text-lg font-semibold text-dark">{instruction}</p>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1 text-xs font-medium text-gray-600">
          <span className={countdown === 3 ? "text-primary" : "text-gray-400"}>3</span>
          <span className="text-gray-400">...</span>
          <span className={countdown === 2 ? "text-primary" : "text-gray-400"}>2</span>
          <span className="text-gray-400">...</span>
          <span className={countdown === 1 ? "text-primary" : "text-gray-400"}>1</span>
        </div>
      </div>

      <BreathingVisualFrame visualClassName="p-4 sm:p-5">
        <div className="flex min-h-72 items-center justify-center">
          <svg
            viewBox="0 0 100 100"
            className="h-64 w-full max-w-xs"
            role="img"
            aria-label="Square guide for box breathing"
          >
            <rect
              x="18"
              y="18"
              width="64"
              height="64"
              rx="3"
              fill="none"
              stroke={BREATHING_BASE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line
              x1={currentPhase.start.x}
              y1={currentPhase.start.y}
              x2={lineEndX}
              y2={lineEndY}
              stroke={BREATHING_ACTIVE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH + 0.5}
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 4px rgba(134, 38, 51, 0.35))" }}
            />
          </svg>
        </div>
      </BreathingVisualFrame>
    </div>
  );
}
