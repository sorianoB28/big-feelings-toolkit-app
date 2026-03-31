"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BREATHING_ACTIVE_GLOW,
  BREATHING_ACTIVE_STROKE,
  BREATHING_BASE_STROKE,
  BREATHING_FILL_END,
  BREATHING_FILL_START,
  BREATHING_STROKE_WIDTH,
  BreathingVisualFrame,
} from "@/components/tools/breathing-visual-frame";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const TOTAL_CYCLES = 10;
const MAX_SECONDS = 120;
const CYCLE_MS = 12_000;
const PATH_D = [
  "M 220 160",
  "C 182 98 114 98 114 160",
  "C 114 222 182 222 220 160",
  "C 258 98 326 98 326 160",
  "C 326 222 258 222 220 160",
].join(" ");

type BreathPhase = "Breathe in" | "Breathe out";

type Point = {
  x: number;
  y: number;
};

function getBreathPhase(cycleProgress: number): BreathPhase {
  return cycleProgress < 0.5 ? "Breathe in" : "Breathe out";
}

export default function InfinityBreathing({
  isRunning,
  isFinished,
  elapsedSeconds,
  durationSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visualElapsedMs, setVisualElapsedMs] = useState(elapsedSeconds * 1000);
  const [pathLength, setPathLength] = useState(0);
  const [dotPoint, setDotPoint] = useState<Point>({ x: 220, y: 160 });
  const previousElapsedRef = useRef(elapsedSeconds);
  const lastTickRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

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

  useEffect(() => {
    if (!pathRef.current) {
      return;
    }

    setPathLength(pathRef.current.getTotalLength());
  }, []);

  const cappedElapsedMs = Math.min(visualElapsedMs, targetDurationMs);
  const completedCycles = Math.min(TOTAL_CYCLES, Math.floor(cappedElapsedMs / CYCLE_MS));
  const currentCycleIndex = Math.min(TOTAL_CYCLES - 1, Math.floor(cappedElapsedMs / CYCLE_MS));
  const cycleElapsedMs = isFinished ? CYCLE_MS : cappedElapsedMs % CYCLE_MS;
  const cycleProgress = Math.min(1, cycleElapsedMs / CYCLE_MS);
  const cycleProgressPercent = Math.min(100, Math.max(0, cycleProgress * 100));
  const displayCycle = isFinished ? TOTAL_CYCLES : Math.min(TOTAL_CYCLES, currentCycleIndex + 1);
  const phase = getBreathPhase(cycleProgress);

  useEffect(() => {
    if (!pathRef.current || pathLength === 0) {
      return;
    }

    const pointAtProgress = pathRef.current.getPointAtLength(pathLength * cycleProgress);
    setDotPoint({ x: pointAtProgress.x, y: pointAtProgress.y });
  }, [cycleProgress, pathLength]);

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
      phaseLabel: phase,
      cycleLabel: `${displayCycle} of ${TOTAL_CYCLES}`,
      cycleProgressPercent,
    });
  }, [cycleProgressPercent, displayCycle, onStatusChange, phase]);

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
    return phase;
  }, [cappedElapsedMs, isFinished, isRunning, phase]);

  const trailProgress = Math.max(0.001, cycleProgress);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Infinity breathing</p>
        <p className="mt-1 text-lg font-semibold text-dark">{instruction}</p>
        <p className="mt-1 text-sm text-slate-600">
          Follow the glowing loop. Inhale across one side, then exhale across the other.
        </p>
      </div>

      <BreathingVisualFrame showAmbientToggle={false} visualClassName="px-4 py-6 sm:px-6 sm:py-8">
        <div className="relative flex min-h-[19rem] items-center justify-center overflow-hidden">
          <div className="pointer-events-none absolute left-[12%] top-[10%] h-24 w-24 rounded-full bg-secondary/12 blur-3xl" />
          <div className="pointer-events-none absolute bottom-[12%] right-[10%] h-28 w-28 rounded-full bg-accent/16 blur-3xl" />

          <svg
            viewBox="0 0 440 320"
            className="relative z-10 h-[18rem] w-full max-w-4xl sm:h-[20rem]"
            role="img"
            aria-label="Infinity loop breathing guide"
          >
            <defs>
              <linearGradient id="infinityBaseGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor={BREATHING_FILL_START} />
                <stop offset="50%" stopColor="rgba(79, 140, 255, 0.18)" />
                <stop offset="100%" stopColor={BREATHING_FILL_END} />
              </linearGradient>
              <linearGradient id="infinityActiveGradient" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#7C6CFF" />
                <stop offset="50%" stopColor={BREATHING_ACTIVE_STROKE} />
                <stop offset="100%" stopColor="#5ED3B3" />
              </linearGradient>
              <radialGradient id="infinityDotGradient" cx="50%" cy="40%" r="65%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
                <stop offset="100%" stopColor={BREATHING_ACTIVE_STROKE} />
              </radialGradient>
            </defs>

            <path
              d={PATH_D}
              fill="none"
              stroke="url(#infinityBaseGradient)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={PATH_D}
              fill="none"
              stroke={BREATHING_BASE_STROKE}
              strokeWidth={BREATHING_STROKE_WIDTH + 6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.82}
            />
            <path
              ref={pathRef}
              d={PATH_D}
              fill="none"
              stroke="url(#infinityActiveGradient)"
              strokeWidth={BREATHING_STROKE_WIDTH + 2}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={`${trailProgress} 1`}
              style={{ filter: `drop-shadow(0 0 8px ${BREATHING_ACTIVE_GLOW})` }}
            />

            <motion.circle
              cx={dotPoint.x}
              cy={dotPoint.y}
              r="11"
              fill="url(#infinityDotGradient)"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="3"
              style={{ filter: `drop-shadow(0 0 16px ${BREATHING_ACTIVE_GLOW})` }}
              animate={isRunning && !prefersReducedMotion ? { r: [11, 13, 11] } : undefined}
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 1.8, ease: "easeInOut", repeat: Infinity }
              }
            />
          </svg>
        </div>
      </BreathingVisualFrame>

      <div className="rounded-[1.5rem] border border-white/65 bg-white/80 px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          <span>Loop {displayCycle} of {TOTAL_CYCLES}</span>
          <span>{phase}</span>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/85">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#7C6CFF_0%,#4F8CFF_55%,#5ED3B3_100%)]"
            animate={{ width: `${cycleProgressPercent}%` }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
          <span>{isRunning ? "Stay with the dot." : "Pause whenever you need to."}</span>
          <span>{Math.round(cycleProgressPercent)}% through this loop</span>
        </div>
      </div>
    </div>
  );
}
