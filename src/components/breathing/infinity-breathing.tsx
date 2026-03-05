"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const DEFAULT_TOTAL_CYCLES = 6;
const DEFAULT_DURATION_SECONDS = 120;
const MIN_DURATION_SECONDS = 30;
const MAX_DURATION_SECONDS = 300;
const PATH_D = [
  "M 200 140",
  "C 160 80 100 80 100 140",
  "C 100 200 160 200 200 140",
  "C 240 80 300 80 300 140",
  "C 300 200 240 200 200 140",
].join(" ");

type InfinityBreathingProps = {
  totalCycles?: number;
  durationSeconds?: number;
  className?: string;
  onFinish?: () => void;
};

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getCyclePhase(cycleProgress: number): "Breathe in" | "Breathe out" {
  return cycleProgress < 0.5 ? "Breathe in" : "Breathe out";
}

export default function InfinityBreathing({
  totalCycles = DEFAULT_TOTAL_CYCLES,
  durationSeconds = DEFAULT_DURATION_SECONDS,
  className,
  onFinish,
}: InfinityBreathingProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeTotalCycles = Math.max(1, Math.floor(totalCycles));
  const safeDurationSeconds = clamp(
    Math.round(durationSeconds),
    MIN_DURATION_SECONDS,
    MAX_DURATION_SECONDS
  );
  const totalDurationMs = safeDurationSeconds * 1000;
  const cycleDurationMs = totalDurationMs / safeTotalCycles;

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [pathLength, setPathLength] = useState(0);
  const [dotPoint, setDotPoint] = useState<Point>({ x: 200, y: 140 });

  const pathRef = useRef<SVGPathElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const finishNotifiedRef = useRef(false);

  const clampedElapsedMs = Math.min(elapsedMs, totalDurationMs);
  const overallProgress = clampedElapsedMs / totalDurationMs;
  const completedCycles = Math.floor(clampedElapsedMs / cycleDurationMs);
  const currentCycleIndex = Math.min(safeTotalCycles - 1, completedCycles);
  const rawCycleElapsedMs = clampedElapsedMs % cycleDurationMs;
  const cycleElapsedMs = isFinished ? cycleDurationMs : rawCycleElapsedMs;
  const cycleProgress = cycleElapsedMs / cycleDurationMs;
  const phaseLabel = isFinished ? "Complete" : getCyclePhase(cycleProgress);

  useEffect(() => {
    if (!pathRef.current) {
      return;
    }

    const measuredLength = pathRef.current.getTotalLength();
    setPathLength(measuredLength);
  }, []);

  useEffect(() => {
    if (!pathRef.current || pathLength === 0) {
      return;
    }

    const pointAtProgress = pathRef.current.getPointAtLength(pathLength * cycleProgress);
    setDotPoint({ x: pointAtProgress.x, y: pointAtProgress.y });
  }, [cycleProgress, pathLength]);

  useEffect(() => {
    if (!isRunning || isFinished) {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      lastFrameRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastFrameRef.current === null) {
        lastFrameRef.current = timestamp;
      }

      const deltaMs = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;

      setElapsedMs((current) => Math.min(current + deltaMs, totalDurationMs));
      frameRef.current = window.requestAnimationFrame(tick);
    };

    frameRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isFinished, isRunning, totalDurationMs]);

  useEffect(() => {
    if (!isFinished && clampedElapsedMs >= totalDurationMs) {
      setElapsedMs(totalDurationMs);
      setIsRunning(false);
      setIsFinished(true);
      if (!finishNotifiedRef.current) {
        finishNotifiedRef.current = true;
        onFinish?.();
      }
    }
  }, [clampedElapsedMs, isFinished, onFinish, totalDurationMs]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const actionLabel = useMemo(() => {
    if (isFinished) {
      return "Start Again";
    }
    if (isRunning) {
      return "Pause";
    }
    if (clampedElapsedMs > 0) {
      return "Resume";
    }
    return "Start";
  }, [clampedElapsedMs, isFinished, isRunning]);

  function handleStartPause() {
    if (isFinished) {
      finishNotifiedRef.current = false;
      setElapsedMs(0);
      setIsFinished(false);
      setIsRunning(true);
      return;
    }
    setIsRunning((current) => !current);
  }

  function handleReset() {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
    }
    lastFrameRef.current = null;
    finishNotifiedRef.current = false;
    setElapsedMs(0);
    setIsRunning(false);
    setIsFinished(false);
  }

  function handleFinish() {
    setElapsedMs(totalDurationMs);
    setIsRunning(false);
    setIsFinished(true);
    if (!finishNotifiedRef.current) {
      finishNotifiedRef.current = true;
      onFinish?.();
    }
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-6 shadow-md supports-[backdrop-filter]:backdrop-blur-md sm:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-gray-500/7 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <header className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-dark">Infinity Breathing</h2>
          <p className="text-sm text-gray-700">Follow the path with your breathing.</p>
          <div className="flex items-center justify-between text-sm font-medium text-gray-700">
            <span>Cycle {Math.min(currentCycleIndex + 1, safeTotalCycles)} of {safeTotalCycles}</span>
            <span>{phaseLabel}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${Math.min(100, Math.max(0, overallProgress * 100))}%` }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
            />
          </div>
        </header>

        <div className="rounded-2xl border border-white/35 bg-white/80 p-4 shadow-sm sm:p-6">
          <svg
            viewBox="0 0 400 280"
            className="mx-auto h-[260px] w-full max-w-3xl"
            role="img"
            aria-label="Infinity breathing path"
          >
            <defs>
              <linearGradient id="infinityPathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(35,31,32,0.24)" />
                <stop offset="50%" stopColor="rgba(134,38,51,0.24)" />
                <stop offset="100%" stopColor="rgba(35,31,32,0.24)" />
              </linearGradient>
              <radialGradient id="dotGradient" cx="50%" cy="40%" r="65%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
                <stop offset="100%" stopColor="rgba(134,38,51,0.85)" />
              </radialGradient>
            </defs>

            <path
              d={PATH_D}
              fill="none"
              stroke="url(#infinityPathGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              ref={pathRef}
              d={PATH_D}
              fill="none"
              stroke="rgba(134,38,51,0.8)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <motion.circle
              cx={dotPoint.x}
              cy={dotPoint.y}
              r="10"
              fill="url(#dotGradient)"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="2"
              animate={
                prefersReducedMotion
                  ? undefined
                  : { r: [10, 11.5, 10], filter: ["drop-shadow(0 0 6px rgba(134,38,51,0.28))", "drop-shadow(0 0 10px rgba(134,38,51,0.4))", "drop-shadow(0 0 6px rgba(134,38,51,0.28))"] }
              }
              transition={
                prefersReducedMotion
                  ? { duration: 0 }
                  : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
              }
            />
          </svg>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
            <span>Cycle Progress</span>
            <span>{Math.round(cycleProgress * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-primary/80"
              animate={{ width: `${Math.min(100, Math.max(0, cycleProgress * 100))}%` }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "linear" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleStartPause}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-primary-dark"
          >
            {actionLabel}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-dark transition duration-200 hover:bg-gray-100"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleFinish}
            disabled={clampedElapsedMs === 0 && !isRunning}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-dark transition duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Finish
          </button>
        </div>
      </div>
    </section>
  );
}
