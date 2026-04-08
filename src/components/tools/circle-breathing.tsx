"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BREATHING_ACTIVE_GLOW,
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
const MIN_SCALE = 1;
const MAX_SCALE = 1.4;

type BreathPhase = "Breathe in" | "Hold" | "Breathe out";

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

function getPhaseMotion(msIntoCycle: number): {
  phase: BreathPhase;
  scale: number;
  glowOpacity: number;
  holdPulseScale: number;
} {
  if (msIntoCycle < INHALE_MS) {
    const progress = msIntoCycle / INHALE_MS;
    return {
      phase: "Breathe in",
      scale: MIN_SCALE + (MAX_SCALE - MIN_SCALE) * progress,
      glowOpacity: 0.28 + progress * 0.4,
      holdPulseScale: 1,
    };
  }

  if (msIntoCycle < INHALE_MS + HOLD_MS) {
    const holdElapsedMs = msIntoCycle - INHALE_MS;
    const pulse = 1 + Math.sin((holdElapsedMs / HOLD_MS) * Math.PI * 2) * 0.03;
    return {
      phase: "Hold",
      scale: MAX_SCALE,
      glowOpacity: 0.62,
      holdPulseScale: pulse,
    };
  }

  const exhaleProgress = (msIntoCycle - INHALE_MS - HOLD_MS) / EXHALE_MS;
  return {
    phase: "Breathe out",
    scale: MAX_SCALE - (MAX_SCALE - MIN_SCALE) * exhaleProgress,
    glowOpacity: 0.62 - exhaleProgress * 0.34,
    holdPulseScale: 1,
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
  const prefersReducedMotion = useReducedMotion();
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

    setVisualElapsedMs((current) =>
      Math.max(current, Math.min(elapsedSeconds * 1000, targetDurationMs))
    );
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

  const progress = useMemo(() => {
    const elapsedTimeMs = Math.min(visualElapsedMs, targetDurationMs);
    const totalTimeMs = Math.max(1, targetDurationMs);
    const currentCycleElapsedMs =
      elapsedTimeMs >= targetDurationMs ? cycleDurationMs : elapsedTimeMs % cycleDurationMs;

    return {
      elapsedTimeMs,
      overallPercent: clampProgress((elapsedTimeMs / totalTimeMs) * 100),
      cyclePercent: clampProgress((currentCycleElapsedMs / cycleDurationMs) * 100),
      currentCycleElapsedMs,
    };
  }, [targetDurationMs, visualElapsedMs]);
  const completedCycles = Math.min(
    TOTAL_CYCLES,
    Math.floor(progress.elapsedTimeMs / cycleDurationMs)
  );
  const currentCycleIndex = Math.min(
    TOTAL_CYCLES - 1,
    Math.floor(progress.elapsedTimeMs / cycleDurationMs)
  );

  useEffect(() => {
    if (isFinished) {
      return;
    }

    if (completedCycles >= TOTAL_CYCLES || progress.elapsedTimeMs >= targetDurationMs) {
      onFinish();
    }
  }, [completedCycles, isFinished, onFinish, progress.elapsedTimeMs, targetDurationMs]);

  const { phase, scale, glowOpacity, holdPulseScale } = useMemo(() => {
    if (isFinished) {
      return {
        phase: "Hold" as BreathPhase,
        scale: MIN_SCALE,
        glowOpacity: 0.3,
        holdPulseScale: 1,
      };
    }

    return getPhaseMotion(progress.currentCycleElapsedMs);
  }, [isFinished, progress.currentCycleElapsedMs]);

  const instruction = useMemo(() => {
    if (isFinished) {
      return "Complete";
    }
    if (!isRunning && progress.elapsedTimeMs === 0) {
      return "Press Start";
    }
    if (!isRunning) {
      return "Paused";
    }
    return phase;
  }, [isFinished, isRunning, phase, progress.elapsedTimeMs]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: phase,
      cycleLabel: `${currentCycleIndex + 1} of ${TOTAL_CYCLES}`,
      cycleProgressPercent: progress.cyclePercent,
      progressPercent: progress.overallPercent,
    });
  }, [currentCycleIndex, onStatusChange, phase, progress.cyclePercent, progress.overallPercent]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Circle breathing
        </p>
        <p className="mt-1 text-lg font-semibold text-dark">{instruction}</p>
        <p className="mt-1 text-sm text-gray-700">
          Expand on the inhale, stay soft on the hold, release on the exhale.
        </p>
      </div>

      <BreathingVisualFrame visualClassName="px-4 py-6 sm:px-6 sm:py-8">
        <div className="relative flex min-h-[20rem] items-center justify-center overflow-hidden">
          <div className="bg-primary/12 pointer-events-none absolute left-[20%] top-[18%] h-24 w-24 rounded-full blur-3xl" />
          <div className="bg-secondary/14 pointer-events-none absolute bottom-[14%] right-[18%] h-28 w-28 rounded-full blur-3xl" />

          <div className="relative flex h-72 w-72 items-center justify-center">
            <motion.div
              className="pointer-events-none absolute h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.18)_0%,rgba(124,108,255,0.1)_45%,transparent_72%)] blur-2xl"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: phase === "Hold" ? holdPulseScale : 1,
                      opacity: glowOpacity,
                    }
              }
              transition={prefersReducedMotion ? undefined : { duration: 0.18, ease: "easeInOut" }}
              style={{
                opacity: glowOpacity,
                transform: `scale(${scale * (phase === "Hold" ? holdPulseScale : 1.02)})`,
              }}
            />

            <motion.div
              className="border-primary/18 pointer-events-none absolute h-52 w-52 rounded-full border"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale: phase === "Hold" ? holdPulseScale : 1,
                      opacity: phase === "Breathe out" ? 0.42 : 0.58,
                    }
              }
              transition={prefersReducedMotion ? undefined : { duration: 0.18, ease: "easeInOut" }}
              style={{ transform: `scale(${scale})` }}
            />

            <motion.div
              className="relative h-40 w-40 rounded-full border border-white/70 bg-[linear-gradient(145deg,rgba(96,165,250,0.92),rgba(124,108,255,0.88))] shadow-[0_24px_64px_-28px_rgba(79,140,255,0.42)]"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      scale,
                      boxShadow:
                        phase === "Breathe in"
                          ? `0 24px 72px -24px ${BREATHING_ACTIVE_GLOW}`
                          : phase === "Hold"
                            ? `0 24px 64px -28px ${BREATHING_ACTIVE_GLOW}`
                            : "0 18px 42px -30px rgba(79, 140, 255, 0.24)",
                    }
              }
              transition={prefersReducedMotion ? undefined : { duration: 0.08, ease: "linear" }}
              style={{
                transform: `scale(${scale})`,
                boxShadow:
                  phase === "Breathe in"
                    ? `0 24px 72px -24px ${BREATHING_ACTIVE_GLOW}`
                    : phase === "Hold"
                      ? `0 24px 64px -28px ${BREATHING_ACTIVE_GLOW}`
                      : "0 18px 42px -30px rgba(79, 140, 255, 0.24)",
              }}
            >
              <div className="absolute inset-3 rounded-full bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.7),rgba(255,255,255,0.12)_38%,transparent_55%)]" />
              <div className="border-white/18 absolute inset-5 rounded-full border" />
            </motion.div>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-white/75 bg-white/80 px-5 py-3 text-center shadow-sm backdrop-blur">
                <p className="text-primary-dark/72 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Phase
                </p>
                <p className="mt-1 text-base font-semibold text-dark">{phase}</p>
              </div>
            </div>
          </div>
        </div>
      </BreathingVisualFrame>
    </div>
  );
}
