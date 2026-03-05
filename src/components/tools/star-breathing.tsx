"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BREATHING_ACTIVE_STROKE,
  BREATHING_BASE_STROKE,
  BREATHING_STROKE_WIDTH,
  BreathingVisualFrame,
} from "@/components/tools/breathing-visual-frame";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const TOTAL_CYCLES = 3;
const MAX_SECONDS = 120;
const EDGE_SECONDS = 4;
const EDGES_PER_CYCLE = 10;
const CYCLE_SECONDS = EDGE_SECONDS * EDGES_PER_CYCLE;
const EDGE_MS = EDGE_SECONDS * 1000;
const CYCLE_MS = CYCLE_SECONDS * 1000;

const STAR_PATH =
  "M50 6 L61 38 L95 38 L67 58 L78 90 L50 70 L22 90 L33 58 L5 38 L39 38 Z";

function getCurrentPrompt(edgeIndex: number): string {
  return edgeIndex % 2 === 0 ? "Breathe in" : "Breathe out";
}

export default function StarBreathing({
  isRunning,
  isFinished,
  elapsedSeconds,
  durationSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const maxDurationSeconds = Math.min(durationSeconds, MAX_SECONDS);
  const maxDurationMs = maxDurationSeconds * 1000;
  const targetDurationMs = Math.min(maxDurationMs, TOTAL_CYCLES * CYCLE_MS);
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
  const currentCycleIndex = Math.min(TOTAL_CYCLES - 1, Math.floor(cappedElapsedMs / CYCLE_MS));
  const cycleElapsedMs = cappedElapsedMs % CYCLE_MS;
  const cycleProgress = cycleElapsedMs / CYCLE_MS;
  const breathEdgeIndex = Math.min(EDGES_PER_CYCLE - 1, Math.floor(cycleElapsedMs / EDGE_MS));
  const cycleProgressPercent = Math.min(100, cycleProgress * 100);
  const traceStrokeLength = Math.min(1, Math.max(0, cycleProgress));

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
      phaseLabel: getCurrentPrompt(breathEdgeIndex),
      cycleLabel: `${currentCycleIndex + 1} of ${TOTAL_CYCLES}`,
      cycleProgressPercent,
    });
  }, [breathEdgeIndex, currentCycleIndex, cycleProgressPercent, onStatusChange]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  const prompt = useMemo(() => {
    if (isFinished) {
      return "Complete";
    }
    if (!isRunning && cappedElapsedMs === 0) {
      return "Press Start";
    }
    if (!isRunning) {
      return "Paused";
    }
    return getCurrentPrompt(breathEdgeIndex);
  }, [breathEdgeIndex, cappedElapsedMs, isFinished, isRunning]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Star breathing</p>
        <p className="mt-1 text-base font-semibold text-dark">{prompt}</p>
        <p className="mt-1 text-sm text-gray-700">
          Trace one edge at a time. Inhale on one edge, exhale on the next. Each edge is 4 seconds.
        </p>
      </div>

      <BreathingVisualFrame visualClassName="p-4 sm:p-5">
        <div className="flex items-center justify-center py-2">
          <svg
            viewBox="0 0 100 100"
            className="h-64 w-full max-w-xs"
            role="img"
            aria-label="Star outline for guided breathing"
          >
            <path
              d={STAR_PATH}
              fill="none"
              stroke={BREATHING_BASE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
            />
            <path
              d={STAR_PATH}
              fill="none"
              stroke={BREATHING_ACTIVE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH + 0.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${traceStrokeLength} 1`}
              style={{ filter: "drop-shadow(0 0 4px rgba(134, 38, 51, 0.35))" }}
            />
          </svg>
        </div>
      </BreathingVisualFrame>
    </div>
  );
}
