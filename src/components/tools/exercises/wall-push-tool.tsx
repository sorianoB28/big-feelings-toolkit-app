"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const PUSH_PHASE_SECONDS = 5;
const RELEASE_PHASE_SECONDS = 5;
const ROUND_SECONDS = PUSH_PHASE_SECONDS + RELEASE_PHASE_SECONDS;

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export default function WallPushTool({
  isRunning,
  elapsedSeconds,
  durationSeconds,
  isFinished,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const [completedPushes, setCompletedPushes] = useState("");

  const totalDurationSeconds = Math.max(1, durationSeconds);
  const totalDurationMs = totalDurationSeconds * 1000;
  const elapsedMs = Math.min(elapsedSeconds * 1000, totalDurationMs);
  const cycleElapsedMs =
    elapsedMs >= totalDurationMs ? ROUND_SECONDS * 1000 : elapsedMs % (ROUND_SECONDS * 1000);
  const cyclePointSeconds = cycleElapsedMs / 1000;
  const isPushPhase = cyclePointSeconds < PUSH_PHASE_SECONDS;
  const phaseLabel = isPushPhase ? "Push" : "Release";
  const phaseSecondsLeft = isPushPhase
    ? Math.max(1, Math.ceil(PUSH_PHASE_SECONDS - cyclePointSeconds))
    : Math.max(1, Math.ceil(ROUND_SECONDS - cyclePointSeconds));
  const totalRounds = Math.max(1, Math.ceil(durationSeconds / ROUND_SECONDS));
  const currentRound = Math.min(totalRounds, Math.floor(elapsedSeconds / ROUND_SECONDS) + 1);
  const cycleProgressPercent = clampProgress((cycleElapsedMs / (ROUND_SECONDS * 1000)) * 100);
  const overallProgressPercent = clampProgress((elapsedMs / totalDurationMs) * 100);
  const sessionComplete = elapsedSeconds >= durationSeconds;

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: sessionComplete ? "Session complete" : phaseLabel,
      cycleLabel: `${currentRound} of ${totalRounds}`,
      cycleProgressPercent: sessionComplete ? 100 : cycleProgressPercent,
      progressPercent: sessionComplete ? 100 : overallProgressPercent,
      holdFinish: sessionComplete && !isFinished,
    });
  }, [
    currentRound,
    cycleProgressPercent,
    isFinished,
    onStatusChange,
    overallProgressPercent,
    phaseLabel,
    sessionComplete,
    totalRounds,
  ]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  const headline = useMemo(() => {
    if (sessionComplete) {
      return "How many pushes did you complete?";
    }

    if (!isRunning) {
      return "Place your hands on the wall at shoulder height.";
    }

    return `${phaseLabel} for ${phaseSecondsLeft}s`;
  }, [isRunning, phaseLabel, phaseSecondsLeft, sessionComplete]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Body reset</p>
        <p className="mt-1 text-base font-semibold text-dark">{headline}</p>
        <p className="mt-1 text-sm text-gray-700">
          Press into the wall for 5 seconds, then soften and release for 5 seconds.
        </p>
      </div>

      <div className="bg-white/84 rounded-[1.6rem] border border-white/70 p-5 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark/70">
              Guided pace
            </p>
            <p className="mt-1 text-sm font-semibold text-dark">
              {sessionComplete ? "Session complete" : phaseLabel}
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">
            {sessionComplete ? "Done" : `${phaseSecondsLeft}s left`}
          </span>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-[1.4rem] border border-white/70 bg-[linear-gradient(180deg,rgba(96,165,250,0.08),rgba(255,255,255,0.92))] px-4 py-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(79,140,255,0.08),transparent)]" />
          <div className="relative flex min-h-[15rem] items-center justify-center rounded-[1.1rem] bg-white/58">
            <Image
              src="/images/Wallpushup-CDC_strength_training_for_older_adults.gif"
              alt="A person demonstrating a wall push exercise"
              width={720}
              height={480}
              unoptimized
              priority
              className="h-auto max-h-[19rem] w-full max-w-[32rem] object-contain [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)]"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="bg-white/88 rounded-[1.2rem] border border-white/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/70">
              Push
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Lean in, straighten your body, and press firmly through your palms.
            </p>
          </div>
          <div className="bg-white/88 rounded-[1.2rem] border border-white/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/70">
              Release
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Soften your arms, step back into neutral, and notice your breath settle.
            </p>
          </div>
        </div>
      </div>

      {sessionComplete ? (
        <div className="bg-white/84 rounded-[1.6rem] border border-white/70 p-5 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
          <label className="block">
            <span className="text-sm font-semibold text-dark">
              How many pushes did you complete?
            </span>
            <span className="mt-1 block text-sm text-slate-600">
              Optional. Leave blank if you do not want to count them.
            </span>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={completedPushes}
              onChange={(event) => setCompletedPushes(event.target.value)}
              placeholder="Optional"
              className="mt-3 min-h-11 w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-base text-dark shadow-sm transition duration-[250ms] ease-out focus:border-primary/45 focus:outline-none focus:ring-2 focus:ring-primary/15"
            />
          </label>

          <button
            type="button"
            onClick={onFinish}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
          >
            Continue
          </button>
        </div>
      ) : null}
    </div>
  );
}
