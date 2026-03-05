"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
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

function getAnimationForPhase(phaseKey: (typeof PHASES)[number]["key"], isRunning: boolean) {
  if (!isRunning) {
    return { scale: 1, rotate: 0, x: 0, y: 0 };
  }

  if (phaseKey === "hands") {
    return { rotate: [-8, 8, -8], x: [-6, 6, -6] };
  }
  if (phaseKey === "arms") {
    return { rotate: [-5, 5, -5], x: [-10, 10, -10] };
  }
  if (phaseKey === "legs") {
    return { y: [0, -10, 0], rotate: [-2, 2, -2] };
  }
  if (phaseKey === "stretch") {
    return { scale: [1, 1.12, 1] };
  }

  return { scale: [1, 0.96, 1], opacity: [1, 0.82, 1] };
}

export default function ShakeOutTool({
  isRunning,
  elapsedSeconds,
  durationSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const [hasCompletedPrimarySequence, setHasCompletedPrimarySequence] = useState(false);
  const [hasRepeatedOnce, setHasRepeatedOnce] = useState(false);
  const [repeatStartSecond, setRepeatStartSecond] = useState<number | null>(null);
  const rewardPlayedRef = useRef(false);
  const previousElapsedRef = useRef(elapsedSeconds);

  const isRepeatActive = hasRepeatedOnce && repeatStartSecond !== null;
  const sequenceElapsedSeconds = isRepeatActive
    ? Math.max(0, elapsedSeconds - repeatStartSecond)
    : elapsedSeconds;
  const clampedSequenceElapsed = Math.min(sequenceElapsedSeconds, SEQUENCE_SECONDS);
  const phaseIndex = Math.min(
    PHASES.length - 1,
    Math.floor(clampedSequenceElapsed / PHASE_SECONDS)
  );
  const currentPhase = PHASES[phaseIndex];
  const elapsedInPhase = clampedSequenceElapsed % PHASE_SECONDS;
  const phaseSecondsLeft = Math.max(1, PHASE_SECONDS - elapsedInPhase);
  const sequenceProgressPercent = Math.min(
    100,
    (clampedSequenceElapsed / SEQUENCE_SECONDS) * 100
  );
  const remainingForRepeat = Math.max(0, durationSeconds - elapsedSeconds);

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (!wasReset) {
      return;
    }

    setHasCompletedPrimarySequence(false);
    setHasRepeatedOnce(false);
    setRepeatStartSecond(null);
    rewardPlayedRef.current = false;
  }, [elapsedSeconds]);

  useEffect(() => {
    if (!hasCompletedPrimarySequence && elapsedSeconds >= SEQUENCE_SECONDS) {
      setHasCompletedPrimarySequence(true);

      if (!rewardPlayedRef.current) {
        rewardPlayedRef.current = true;
        void triggerCompletionReward();
      }
    }
  }, [elapsedSeconds, hasCompletedPrimarySequence]);

  useEffect(() => {
    if (isRepeatActive && sequenceElapsedSeconds >= SEQUENCE_SECONDS) {
      onFinish();
    }
  }, [isRepeatActive, onFinish, sequenceElapsedSeconds]);

  useEffect(() => {
    const phaseLabel = hasCompletedPrimarySequence && !isRepeatActive
      ? "Sequence complete"
      : currentPhase.title;

    onStatusChange?.({
      phaseLabel,
      cycleLabel: `${phaseIndex + 1} of ${PHASES.length}`,
      cycleProgressPercent: hasCompletedPrimarySequence && !isRepeatActive ? 100 : sequenceProgressPercent,
    });
  }, [
    currentPhase.title,
    hasCompletedPrimarySequence,
    isRepeatActive,
    onStatusChange,
    phaseIndex,
    sequenceProgressPercent,
  ]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  const canRepeat = hasCompletedPrimarySequence && !hasRepeatedOnce && remainingForRepeat >= PHASE_SECONDS;
  const animation = useMemo(
    () => getAnimationForPhase(currentPhase.key, isRunning),
    [currentPhase.key, isRunning]
  );

  function handleRepeatOnce() {
    if (!canRepeat) {
      return;
    }

    setHasRepeatedOnce(true);
    setRepeatStartSecond(elapsedSeconds);
  }

  const headline = hasCompletedPrimarySequence && !isRepeatActive
    ? "Nice reset. Ready to finish?"
    : isRepeatActive
      ? "Bonus round"
      : currentPhase.title;

  const prompt = hasCompletedPrimarySequence && !isRepeatActive
    ? "You completed one full shake-out sequence."
    : currentPhase.prompt;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Release energy</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning ? headline : "Press start when you are ready to move safely."}
        </p>
        <p className="mt-1 text-sm text-gray-700">{prompt}</p>
      </div>

      <div className="rounded-xl border border-border-soft bg-surface p-5 text-center">
        <motion.div
          className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-4xl"
          animate={animation}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
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
          <span>{Math.round(sequenceProgressPercent)}%</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-[200ms] ease-out"
            style={{
              width: `${hasCompletedPrimarySequence && !isRepeatActive ? 100 : sequenceProgressPercent}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-600">
          10s each: hands, arms, legs, big stretch, stillness.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {hasCompletedPrimarySequence ? (
          <button
            type="button"
            onClick={onFinish}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
          >
            Finish Sequence
          </button>
        ) : null}

        <button
          type="button"
          onClick={handleRepeatOnce}
          disabled={!canRepeat}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
        >
          Repeat Once (Optional)
        </button>
      </div>
    </div>
  );
}

