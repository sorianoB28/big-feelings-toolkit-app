"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowUp,
  Check,
  Hand,
  RefreshCw,
  Sparkles,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const STRETCH_STEPS: Array<{
  id: string;
  title: string;
  prompt: string;
  support: string;
  Icon: LucideIcon;
}> = [
  {
    id: "shoulders",
    title: "Roll your shoulders",
    prompt: "Lift them up, roll them back, and let them drop.",
    support: "Keep the movement small and easy.",
    Icon: RefreshCw,
  },
  {
    id: "arms",
    title: "Stretch your arms",
    prompt: "Reach forward or overhead without forcing the stretch.",
    support: "Lengthen gently, then soften.",
    Icon: ArrowUp,
  },
  {
    id: "hands",
    title: "Loosen your hands",
    prompt: "Open your fingers wide, then let them relax.",
    support: "Notice the tension leaving your hands.",
    Icon: Hand,
  },
  {
    id: "side",
    title: "Ease side to side",
    prompt: "Lean a little left and right to loosen your upper body.",
    support: "A small sway is enough.",
    Icon: ArrowLeftRight,
  },
  {
    id: "breath",
    title: "Take one full breath",
    prompt: "Inhale slowly, then exhale and notice what feels softer.",
    support: "Let this be your settling moment.",
    Icon: Wind,
  },
];

function getStepAnimation(stepId: string, isRunning: boolean) {
  if (!isRunning) {
    return { scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 };
  }

  switch (stepId) {
    case "shoulders":
      return { rotate: [0, 10, -10, 0] };
    case "arms":
      return { y: [0, -8, 0], scale: [1, 1.04, 1] };
    case "hands":
      return { scale: [1, 1.08, 1], rotate: [0, 4, -4, 0] };
    case "side":
      return { x: [0, 10, -10, 0] };
    case "breath":
      return { scale: [0.96, 1.05, 0.96], opacity: [0.82, 1, 0.82] };
    default:
      return { scale: 1 };
  }
}

export default function StretchFlow({
  isRunning,
  isFinished,
  elapsedSeconds,
  durationSeconds,
  onStatusChange,
}: ToolRuntimeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visualElapsedMs, setVisualElapsedMs] = useState(elapsedSeconds * 1000);
  const previousElapsedRef = useRef(elapsedSeconds);
  const lastTickRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const targetDurationMs = Math.max(durationSeconds, 1) * 1000;
  const stepDurationMs = targetDurationMs / STRETCH_STEPS.length;

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
  const rawStepIndex = Math.floor(cappedElapsedMs / stepDurationMs);
  const currentStepIndex = Math.min(STRETCH_STEPS.length - 1, rawStepIndex);
  const currentStep = STRETCH_STEPS[currentStepIndex];
  const nextStep =
    currentStepIndex < STRETCH_STEPS.length - 1 ? STRETCH_STEPS[currentStepIndex + 1] : null;
  const stepElapsedMs = isFinished ? stepDurationMs : cappedElapsedMs % stepDurationMs;
  const stepProgressPercent = Math.min(100, Math.max(0, (stepElapsedMs / stepDurationMs) * 100));
  const currentStepSecondsLeft = isFinished
    ? 0
    : Math.max(1, Math.ceil((stepDurationMs - stepElapsedMs) / 1000));
  const completedSteps = isFinished ? STRETCH_STEPS.length : currentStepIndex;
  const overallSequencePercent = Math.min(
    100,
    Math.max(0, ((completedSteps + stepElapsedMs / stepDurationMs) / STRETCH_STEPS.length) * 100),
  );

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: isFinished ? "Complete" : currentStep.title,
      cycleLabel: `${Math.min(currentStepIndex + 1, STRETCH_STEPS.length)} of ${STRETCH_STEPS.length}`,
      cycleProgressPercent: stepProgressPercent,
    });
  }, [currentStep.title, currentStepIndex, isFinished, onStatusChange, stepProgressPercent]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  const currentAnimation = useMemo(
    () => getStepAnimation(currentStep.id, isRunning && !isFinished),
    [currentStep.id, isFinished, isRunning],
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Stretch flow</p>
        <p className="mt-1 text-lg font-semibold text-dark">
          {isFinished
            ? "Nice work. Let that steadier feeling settle in."
            : "Move gently through a short reset for tension and restless energy."}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Small stretches count. You can use the controls below to start, pause, or reset any time.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(234,242,255,0.84)_48%,rgba(247,250,252,0.76))] p-4 shadow-[0_24px_54px_-34px_rgba(79,140,255,0.24)] sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[1.7rem] border border-white/75 bg-white/84 p-5 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark/72">
                    Current step
                  </p>
                  <h3 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.04em] text-dark">
                    {currentStep.title}
                  </h3>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark">
                  {currentStepSecondsLeft}s left
                </span>
              </div>

              <div className="mt-6 flex flex-col items-center text-center">
                <motion.div
                  className="flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(79,140,255,0.14),rgba(124,108,255,0.12),rgba(94,211,179,0.16))] text-primary-dark shadow-[0_20px_36px_-28px_rgba(79,140,255,0.4)]"
                  animate={prefersReducedMotion ? undefined : currentAnimation}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 1.8, ease: "easeInOut", repeat: Infinity }
                  }
                >
                  <currentStep.Icon className="h-10 w-10" />
                </motion.div>
                <p className="mt-5 text-base font-semibold text-dark">{currentStep.prompt}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{currentStep.support}</p>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/75 bg-white/84 p-5 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-dark">Step pacing</p>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  {Math.round(stepProgressPercent)}%
                </span>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80">
                <motion.div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#7C6CFF_0%,#4F8CFF_58%,#5ED3B3_100%)]"
                  animate={{ width: `${stepProgressPercent}%` }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                />
              </div>

              <div className="mt-5 rounded-[1.35rem] border border-white/70 bg-[linear-gradient(135deg,rgba(79,140,255,0.07),rgba(124,108,255,0.05),rgba(255,255,255,0.92))] px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark/70">
                  Next up
                </p>
                {nextStep ? (
                  <>
                    <p className="mt-2 text-sm font-semibold text-dark">{nextStep.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{nextStep.prompt}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-sm font-semibold text-dark">Settle and finish</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      You are on the last step. Let the final breath be your transition back.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-5 lg:grid-cols-1 xl:grid-cols-5">
                {STRETCH_STEPS.map((step, index) => {
                  const isComplete = isFinished || index < currentStepIndex;
                  const isCurrent = !isFinished && index === currentStepIndex;

                  return (
                    <div
                      key={step.id}
                      className={`rounded-[1.2rem] border px-3 py-3 text-center transition duration-[220ms] ease-out ${
                        isCurrent
                          ? "border-primary/35 bg-primary/8 shadow-[0_18px_30px_-28px_rgba(79,140,255,0.36)]"
                          : isComplete
                            ? "border-white/70 bg-white/90"
                            : "border-white/70 bg-white/72"
                      }`}
                    >
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/88 text-primary-dark shadow-sm">
                        {isComplete ? <Check className="h-4 w-4" /> : <step.Icon className="h-4 w-4" />}
                      </div>
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {index + 1}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[1.7rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-dark">Sequence progress</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">
                {Math.round(overallSequencePercent)}%
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7C6CFF_0%,#4F8CFF_58%,#5ED3B3_100%)]"
                animate={{ width: `${overallSequencePercent}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              />
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Five gentle prompts move you from tension into a calmer breath.
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(79,140,255,0.14),rgba(124,108,255,0.12),rgba(94,211,179,0.16))] text-primary-dark shadow-sm">
                <Sparkles className="h-[18px] w-[18px]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark">Gentle pacing</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  This is meant to feel steady and supportive, not intense. Small movement is enough.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
