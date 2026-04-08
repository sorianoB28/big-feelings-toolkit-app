"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ProgressBar, normalizeProgressValue } from "@/components/ui/ProgressBar";
import { triggerCompletionReward } from "@/lib/completion-reward";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const PHASE_SECONDS = 10;

const PHASES = [
  {
    key: "hands",
    title: "Shake Hands",
    prompt: "Shake your hands quickly and safely at your sides.",
    emoji: "🤲",
  },
  {
    key: "arms",
    title: "Shake Arms",
    prompt: "Loosen your shoulders and shake your arms out.",
    emoji: "💪",
  },
  {
    key: "legs",
    title: "Shake Legs",
    prompt: "Shake your legs or bounce your feet in place.",
    emoji: "🦵",
  },
  {
    key: "stretch",
    title: "Big Stretch",
    prompt: "Reach tall, take a full breath, and stretch gently.",
    emoji: "🙆",
  },
  {
    key: "stillness",
    title: "Stillness",
    prompt: "Stand still and notice your body getting calmer.",
    emoji: "🧘",
  },
] as const;

const SEQUENCE_SECONDS = PHASE_SECONDS * PHASES.length;

function getAnimationForPhase(phaseKey: (typeof PHASES)[number]["key"]) {
  if (phaseKey === "hands") {
    return { rotate: [-8, 8, -8], x: [-6, 6, -6] };
  }
  if (phaseKey === "arms") {
    return { rotate: [-5, 5, -5], x: [-10, 10, -10] };
  }
  if (phaseKey === "legs") {
    return { y: [0, -10, 0], rotate: [-2, 2, -2] };
  }

  return null;
}

function getRestAnimation() {
  return { scale: 1, rotate: 0, x: 0, y: 0, opacity: 1 };
}

export default function ShakeOutTool({
  isRunning,
  isFinished,
  elapsedSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const rewardPlayedRef = useRef(false);
  const previousElapsedRef = useRef(elapsedSeconds);

  const clampedSequenceElapsed = Math.min(elapsedSeconds, SEQUENCE_SECONDS);
  const phaseIndex = Math.min(
    PHASES.length - 1,
    Math.floor(clampedSequenceElapsed / PHASE_SECONDS)
  );
  const currentPhase = PHASES[phaseIndex];
  const elapsedInPhase = clampedSequenceElapsed % PHASE_SECONDS;
  const phaseSecondsLeft = Math.max(1, PHASE_SECONDS - elapsedInPhase);
  const sequenceProgressPercent = Math.min(100, (clampedSequenceElapsed / SEQUENCE_SECONDS) * 100);
  const displayedSequenceProgressPercent = normalizeProgressValue(sequenceProgressPercent);
  const isSequenceComplete = elapsedSeconds >= SEQUENCE_SECONDS;

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (wasReset) {
      rewardPlayedRef.current = false;
    }
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!isSequenceComplete || isFinished) {
      return;
    }

    if (!rewardPlayedRef.current) {
      rewardPlayedRef.current = true;
      void triggerCompletionReward();
    }

    onFinish();
  }, [isFinished, isSequenceComplete, onFinish]);

  useEffect(() => {
    const phaseLabel = isSequenceComplete ? "Sequence complete" : currentPhase.title;

    onStatusChange?.({
      phaseLabel,
      cycleLabel: `${phaseIndex + 1} of ${PHASES.length}`,
      cycleProgressPercent: isSequenceComplete ? 100 : sequenceProgressPercent,
      progressPercent: isSequenceComplete ? 100 : sequenceProgressPercent,
    });
  }, [currentPhase.title, isSequenceComplete, onStatusChange, phaseIndex, sequenceProgressPercent]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  const phaseAnimation = useMemo(() => getAnimationForPhase(currentPhase.key), [currentPhase.key]);
  const shouldAnimate = isRunning && !isFinished && !isSequenceComplete && phaseAnimation !== null;
  const headline = isSequenceComplete ? "Nice reset" : currentPhase.title;
  const prompt = isSequenceComplete
    ? "You completed the full shake-out sequence."
    : currentPhase.prompt;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Release energy</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning && !isSequenceComplete
            ? headline
            : "Press start when you are ready to move safely."}
        </p>
        <p className="mt-1 text-sm text-gray-700">{prompt}</p>
      </div>

      <div className="rounded-xl border border-border-soft bg-surface p-5 text-center">
        <motion.div
          className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl"
          animate={shouldAnimate ? phaseAnimation : getRestAnimation()}
          transition={
            shouldAnimate
              ? { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.18, ease: "easeOut" }
          }
        >
          {currentPhase.emoji}
        </motion.div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Time left in this step
        </p>
        <p className="mt-1 text-5xl font-semibold text-dark">{phaseSecondsLeft}</p>
      </div>

      <div className="rounded-lg border border-border-soft bg-surface p-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-600">
          <span>Sequence progress</span>
          <span>{displayedSequenceProgressPercent}%</span>
        </div>
        <ProgressBar
          value={isSequenceComplete ? 100 : displayedSequenceProgressPercent}
          className="mt-2 h-2 bg-gray-200"
          fillClassName="bg-primary"
        />
        <p className="mt-2 text-xs text-gray-600">
          10s each: hands, arms, legs, big stretch, stillness.
        </p>
      </div>
    </div>
  );
}
