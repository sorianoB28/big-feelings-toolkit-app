"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const INHALE_MS = 4000;
const HOLD_MS = 4000;
const EXHALE_MS = 4000;
const CYCLE_DURATION_MS = INHALE_MS + HOLD_MS + EXHALE_MS;
const DEFAULT_TOTAL_CYCLES = 6;
const MIN_SCALE = 0.78;
const MAX_SCALE = 1.08;

type BreathPhase = "inhale" | "hold" | "exhale";

type CircleBreathingProps = {
  totalCycles?: number;
  soundEnabled?: boolean;
  className?: string;
  onFinish?: () => void;
};

function getBreathPhase(cycleElapsedMs: number): BreathPhase {
  if (cycleElapsedMs < INHALE_MS) {
    return "inhale";
  }
  if (cycleElapsedMs < INHALE_MS + HOLD_MS) {
    return "hold";
  }
  return "exhale";
}

function getScale(cycleElapsedMs: number): number {
  if (cycleElapsedMs < INHALE_MS) {
    const inhaleProgress = cycleElapsedMs / INHALE_MS;
    return MIN_SCALE + (MAX_SCALE - MIN_SCALE) * inhaleProgress;
  }

  if (cycleElapsedMs < INHALE_MS + HOLD_MS) {
    return MAX_SCALE;
  }

  const exhaleProgress = (cycleElapsedMs - INHALE_MS - HOLD_MS) / EXHALE_MS;
  return MAX_SCALE - (MAX_SCALE - MIN_SCALE) * exhaleProgress;
}

function getPhaseLabel(phase: BreathPhase): "Breathe in" | "Hold" | "Breathe out" {
  if (phase === "inhale") {
    return "Breathe in";
  }
  if (phase === "hold") {
    return "Hold";
  }
  return "Breathe out";
}

export default function CircleBreathing({
  totalCycles = DEFAULT_TOTAL_CYCLES,
  soundEnabled = false,
  className,
  onFinish,
}: CircleBreathingProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeTotalCycles = Math.max(1, Math.floor(totalCycles));
  const totalDurationMs = safeTotalCycles * CYCLE_DURATION_MS;

  const [elapsedMs, setElapsedMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const frameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<BreathPhase | null>(null);
  const finishNotifiedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const clampedElapsedMs = Math.min(elapsedMs, totalDurationMs);
  const overallProgress = clampedElapsedMs / totalDurationMs;
  const completedCycles = Math.floor(clampedElapsedMs / CYCLE_DURATION_MS);
  const currentCycleIndex = Math.min(safeTotalCycles - 1, completedCycles);

  const rawCycleElapsedMs = clampedElapsedMs % CYCLE_DURATION_MS;
  const cycleElapsedMs = isFinished ? CYCLE_DURATION_MS : rawCycleElapsedMs;
  const cycleProgress = cycleElapsedMs / CYCLE_DURATION_MS;

  const phase = useMemo(() => getBreathPhase(rawCycleElapsedMs), [rawCycleElapsedMs]);
  const phaseLabel = useMemo(() => getPhaseLabel(phase), [phase]);
  const circleScale = useMemo(() => getScale(rawCycleElapsedMs), [rawCycleElapsedMs]);

  const playChime = useCallback(() => {
    if (!soundEnabled || !hasInteracted || typeof window === "undefined") {
      return;
    }

    const AudioCtor =
      window.AudioContext ||
      ((window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ??
        null);

    if (!AudioCtor) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtor();
    }

    const audioContext = audioContextRef.current;
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 528;
    gainNode.gain.value = 0.001;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const start = audioContext.currentTime;
    gainNode.gain.exponentialRampToValueAtTime(0.035, start + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);

    oscillator.start(start);
    oscillator.stop(start + 0.3);
  }, [hasInteracted, soundEnabled]);

  const finishSession = useCallback(() => {
    setElapsedMs(totalDurationMs);
    setIsRunning(false);
    setIsFinished(true);
    if (!finishNotifiedRef.current) {
      finishNotifiedRef.current = true;
      onFinish?.();
    }
  }, [onFinish, totalDurationMs]);

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
      finishSession();
    }
  }, [clampedElapsedMs, finishSession, isFinished, totalDurationMs]);

  useEffect(() => {
    if (!isRunning || isFinished) {
      prevPhaseRef.current = phase;
      return;
    }

    if (prevPhaseRef.current && prevPhaseRef.current !== phase) {
      playChime();
    }

    prevPhaseRef.current = phase;
  }, [isFinished, isRunning, phase, playChime]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      void audioContextRef.current?.close();
    };
  }, []);

  const primaryButtonLabel = useMemo(() => {
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

  const statusText = useMemo(() => {
    if (isFinished) {
      return "Nice work";
    }
    if (!isRunning && clampedElapsedMs === 0) {
      return "Ready to begin";
    }
    if (!isRunning) {
      return "Paused";
    }
    return phaseLabel;
  }, [clampedElapsedMs, isFinished, isRunning, phaseLabel]);

  function handleStartPause() {
    setHasInteracted(true);

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
    lastTickRef.current = null;
    finishNotifiedRef.current = false;
    prevPhaseRef.current = null;
    setElapsedMs(0);
    setIsRunning(false);
    setIsFinished(false);
  }

  function handleFinish() {
    finishSession();
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-6 shadow-md supports-[backdrop-filter]:backdrop-blur-md sm:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-gray-500/7 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-dark">Circle Breathing</h2>
            <p className="text-sm font-medium text-gray-700">
              Cycle {Math.min(currentCycleIndex + 1, safeTotalCycles)} of {safeTotalCycles}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
              <span>Total Progress</span>
              <span>{Math.round(overallProgress * 100)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-primary"
                animate={{ width: `${Math.min(100, Math.max(0, overallProgress * 100))}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
              />
            </div>
          </div>
        </header>

        <div className="rounded-2xl border border-white/40 bg-white/80 p-6 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{statusText}</p>
          <p className="mt-1 text-sm text-gray-700">4s inhale • 4s hold • 4s exhale</p>

          <div className="mt-6 flex justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border border-gray-200/80 bg-gradient-to-b from-gray-100 to-gray-200/70">
              <motion.div
                className="absolute h-44 w-44 rounded-full bg-primary/15 blur-2xl"
                animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
                }
              />
              <motion.div
                className="relative h-36 w-36 rounded-full border border-primary/40 bg-gradient-to-br from-primary/35 via-primary/45 to-primary/70"
                animate={{ scale: circleScale }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.12, ease: "linear" }}
              />
            </div>
          </div>
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
            {primaryButtonLabel}
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
