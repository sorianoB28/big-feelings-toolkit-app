"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "framer-motion";
import { createToolUseAction } from "@/app/(app)/tools/actions";
import { ClassroomSafeToggle } from "@/components/student/classroom-safe-toggle";
import { ReturnScreen, type ReturnScreenResult } from "@/components/student/return-screen";
import { GlassCard } from "@/components/ui/glass-card";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";
import { MotionButton } from "@/components/ui/motion-primitives";
import { useAmbientSound } from "@/hooks/useAmbientSound";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { useStudentTheme } from "@/hooks/useStudentTheme";
import { useZoneTheme } from "@/hooks/useZoneTheme";
import type { CheckinZoneId, ToolCategory } from "@/lib/checkin-options";
import { getMotionPreferences } from "@/lib/motion";
import type { ToolRuntimeProps, ToolRuntimeStatus } from "@/lib/tools/registry";

type ToolRunnerProps = {
  toolKey: string;
  toolCategory: ToolCategory;
  toolLabel: string;
  title: string;
  description: string;
  durationSeconds: number;
  ToolComponent: ComponentType<ToolRuntimeProps>;
  from?: string | null;
  zone?: string | null;
  checkinId?: string | null;
  studentId?: string | null;
  themeKey?: string | null;
};

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizeZone(value: string | null): CheckinZoneId | null {
  if (value === "green" || value === "yellow" || value === "blue" || value === "red") {
    return value;
  }

  return null;
}

export function ToolRunner({
  toolKey,
  toolCategory,
  toolLabel,
  title,
  description,
  durationSeconds,
  ToolComponent,
  from = null,
  zone = null,
  checkinId = null,
  studentId = null,
  themeKey = null,
}: ToolRunnerProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const motionPreferences = getMotionPreferences(classroomSafeMode, Boolean(prefersReducedMotion));
  const normalizedZone = normalizeZone(zone);
  const studentTheme = useStudentTheme(themeKey);
  const zoneTheme = useZoneTheme(normalizedZone);
  const progressColor = normalizedZone ? zoneTheme.primaryColor : "#862633";
  const cycleColor = normalizedZone ? zoneTheme.accentColor : "#a94753";
  const fromReset = from === "reset";
  const fromCheckin = from === "checkin";
  const safeCheckinId = checkinId?.trim() ?? "";
  const safeStudentId = studentId?.trim() ?? "";
  const hasCheckinContext =
    fromCheckin && safeCheckinId.length > 0 && safeStudentId.length > 0;
  const checkinToolsHref = `/students/${encodeURIComponent(
    safeStudentId
  )}/checkin/tools?checkinId=${encodeURIComponent(safeCheckinId)}`;
  const checkinFinishHref = `/students/${encodeURIComponent(
    safeStudentId
  )}/checkin/finish?checkinId=${encodeURIComponent(safeCheckinId)}`;
  const { enabled: ambientSoundEnabled, toggleEnabled: toggleAmbientSound } = useAmbientSound({
    enabled: false,
    volume: 0.22,
    soundType: "rain",
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [visualElapsedMs, setVisualElapsedMs] = useState(0);
  const [toolStatus, setToolStatus] = useState<ToolRuntimeStatus | null>(null);
  const [helpfulRating, setHelpfulRating] = useState<number | null>(null);
  const [isSavingToolUse, setIsSavingToolUse] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isComplete = elapsedSeconds >= durationSeconds;
  const durationMs = Math.max(0, durationSeconds * 1000);
  const clampedVisualElapsedMs = Math.min(visualElapsedMs, durationMs);
  const displayElapsedSeconds = Math.floor(clampedVisualElapsedMs / 1000);
  const remainingSeconds = Math.max(0, durationSeconds - displayElapsedSeconds);

  useEffect(() => {
    if (elapsedSeconds === 0) {
      setVisualElapsedMs(0);
      return;
    }

    setVisualElapsedMs((current) =>
      Math.max(current, Math.min(elapsedSeconds * 1000, durationMs))
    );
  }, [durationMs, elapsedSeconds]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => Math.min(current + 1, durationSeconds));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [durationSeconds, isRunning]);

  useEffect(() => {
    if (!isRunning || isFinished || isComplete) {
      return;
    }

    let frameId: number | null = null;
    let lastTick = 0;

    const tick = (timestamp: number) => {
      if (lastTick === 0) {
        lastTick = timestamp;
      }

      const deltaMs = timestamp - lastTick;
      lastTick = timestamp;

      setVisualElapsedMs((current) => Math.min(current + deltaMs, durationMs));
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [durationMs, isComplete, isFinished, isRunning]);

  useEffect(() => {
    if (isComplete && isRunning) {
      setIsRunning(false);
    }
  }, [isComplete, isRunning]);

  useEffect(() => {
    if (isComplete && !isFinished) {
      setIsFinished(true);
    }
  }, [isComplete, isFinished]);

  const overallProgressPercent = useMemo(() => {
    if (durationMs <= 0) {
      return 0;
    }
    return Math.min(100, (clampedVisualElapsedMs / durationMs) * 100);
  }, [clampedVisualElapsedMs, durationMs]);

  const phaseLabel = isFinished
    ? "Complete"
    : isRunning
      ? (toolStatus?.phaseLabel ?? "In progress")
      : elapsedSeconds === 0
        ? "Ready"
        : "Paused";
  const cycleProgressPercent = Math.min(100, Math.max(0, toolStatus?.cycleProgressPercent ?? 0));
  const hasCycleProgress = typeof toolStatus?.cycleProgressPercent === "number";

  const runtimeProps: ToolRuntimeProps = {
    isRunning,
    isFinished,
    elapsedSeconds,
    remainingSeconds,
    durationSeconds,
    progressPercent: Math.round(overallProgressPercent),
    onFinish: () => {
      setIsRunning(false);
      setIsFinished(true);
      setToolStatus((current) => ({
        ...current,
        phaseLabel: "Complete",
      }));
    },
    onStatusChange: setToolStatus,
  };

  function handleStartPause() {
    if (isRunning) {
      setIsRunning(false);
      return;
    }

    if (isComplete || isFinished) {
      setElapsedSeconds(0);
      setVisualElapsedMs(0);
      setIsFinished(false);
      setToolStatus(null);
    }

    setIsRunning(true);
  }

  function handleReset() {
    setIsRunning(false);
    setIsFinished(false);
    setElapsedSeconds(0);
    setVisualElapsedMs(0);
    setToolStatus(null);
    setHelpfulRating(null);
    setSaveError(null);
    setIsSavingToolUse(false);
  }

  function handleBack() {
    if (hasCheckinContext) {
      router.push(checkinToolsHref);
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fromReset ? "/reset" : "/tools");
  }

  function handleReturnSubmit(result: ReturnScreenResult) {
    const params = new URLSearchParams();
    params.set("ready", "1");
    params.set("firstStep", result.firstStepKey);

    if (zone) {
      params.set("zone", zone);
    }
    if (result.otherText) {
      params.set("otherStep", result.otherText);
    }

    if (hasCheckinContext) {
      router.push(checkinFinishHref);
      return;
    }

    const destination = fromReset ? "/reset" : "/tools";
    router.push(`${destination}?${params.toString()}`);
  }

  async function handleCheckinContinue() {
    if (!hasCheckinContext || isSavingToolUse) {
      return;
    }

    setIsSavingToolUse(true);
    setSaveError(null);

    try {
      const durationSecondsUsed = Math.max(1, Math.round(clampedVisualElapsedMs / 1000));
      const saveResult = await createToolUseAction({
        checkinId: safeCheckinId,
        toolKey,
        toolCategory,
        label: toolLabel,
        durationSeconds: durationSecondsUsed,
        helpfulRating,
      });

      if (!saveResult.ok) {
        setSaveError(saveResult.error);
      }
    } catch {
      setSaveError("Tool completion could not be saved. Continuing anyway.");
    } finally {
      setIsSavingToolUse(false);
      router.push(checkinFinishHref);
    }
  }

  const startButtonLabel =
    isRunning ? "Pause" : isComplete || elapsedSeconds === 0 ? "Start" : "Resume";
  const roundedProgressPercent = Math.round(overallProgressPercent);
  const progressTransitionDurationMs = Math.round(
    motionPreferences.durations.standard * 1000
  );
  const cycleTransitionDurationMs = Math.round(motionPreferences.durations.quick * 1000);

  return (
    <section className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl p-4 sm:p-6">
      <div
        className={`absolute inset-0 z-0 bg-gradient-to-br ${studentTheme.backgroundClassName}`}
        style={{ backgroundImage: studentTheme.backgroundGradient }}
      />
      <div
        className="absolute inset-0 z-0"
        style={{
          opacity: studentTheme.patternOverlay.opacity,
          backgroundImage: studentTheme.patternOverlay.backgroundImage,
        }}
      />
      <div
        className="absolute -right-28 top-[-5rem] z-0 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: zoneTheme.accentColor, opacity: normalizedZone ? 0.08 : 0.04 }}
      />
      <div
        className="absolute -left-24 bottom-[-6rem] z-0 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: zoneTheme.primaryColor, opacity: normalizedZone ? 0.07 : 0.04 }}
      />

      <div className="relative z-10 flex flex-col gap-6">
      <GlassCard variant="soft" accent className="p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h1 className="tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-gray-700">{description}</p>
            <button
              type="button"
              onClick={toggleAmbientSound}
              className="mt-3 inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-dark transition duration-[250ms] ease-out hover:bg-gray-100"
            >
              Sound: {ambientSoundEnabled ? "On" : "Off"}
            </button>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ClassroomSafeToggle />
            <div className="rounded-xl border border-white/35 bg-white/70 px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Time remaining
              </p>
              <p className="mt-1 text-2xl font-semibold text-dark">
                {formatClock(remainingSeconds)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-border-soft bg-white/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-medium text-gray-700">
            <span>Overall progress</span>
            <span>{roundedProgressPercent}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-gray-300">
            <div
              className="h-full rounded-full transition-all duration-[250ms] ease-out"
              style={{
                width: `${overallProgressPercent}%`,
                backgroundColor: progressColor,
                transitionDuration: `${progressTransitionDurationMs}ms`,
              }}
              aria-hidden
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
              style={{
                backgroundColor: "rgba(31, 41, 55, 0.08)",
                color: "#231F20",
              }}
            >
              Phase: {phaseLabel}
            </span>
            {toolStatus?.cycleLabel ? (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: `${progressColor}20`,
                  color: progressColor,
                }}
              >
                Cycle {toolStatus.cycleLabel}
              </span>
            ) : null}
          </div>

          {hasCycleProgress ? (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-600">
                <span>Cycle progress</span>
                <span>{Math.round(cycleProgressPercent)}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full transition-all duration-[200ms] ease-out"
                  style={{
                    width: `${cycleProgressPercent}%`,
                    backgroundColor: cycleColor,
                    transitionDuration: `${cycleTransitionDurationMs}ms`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs uppercase tracking-wide text-gray-500">
          <span>Elapsed {formatClock(displayElapsedSeconds)}</span>
          <span>Remaining {formatClock(remainingSeconds)}</span>
        </div>
      </GlassCard>

      {!isFinished ? (
        <GlassCard variant="default" className="mx-auto w-full max-w-3xl p-4 sm:p-6">
          <ToolComponent {...runtimeProps} />
        </GlassCard>
      ) : hasCheckinContext ? (
        <GlassCard variant="default" className="mx-auto w-full max-w-2xl p-6 text-center sm:p-8">
          <p className="text-2xl font-semibold text-dark">Nice work.</p>
          <p className="mt-2 text-sm text-gray-700">
            You finished this tool. Choose your first step back to close the check-in.
          </p>
          <div className="mt-5 text-left">
            <p className="text-sm font-semibold text-dark">How helpful was this tool? (Optional)</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setHelpfulRating(value)}
                  className={`min-h-10 rounded-lg border text-sm font-medium transition duration-[250ms] ease-out ${
                    helpfulRating === value
                      ? "border-primary bg-primary/10 text-primary-dark"
                      : "border-gray-300 bg-white text-dark hover:border-primary/35 hover:bg-primary/5"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <MotionButton
            type="button"
            onClick={handleCheckinContinue}
            disabled={isSavingToolUse}
            className={`${buttonPrimaryClass} mt-6 min-h-12 min-w-48`}
          >
            {isSavingToolUse ? "Saving..." : "Continue"}
          </MotionButton>
          {saveError ? <p className="mt-3 text-sm text-gray-700">{saveError}</p> : null}
        </GlassCard>
      ) : (
        <ReturnScreen zone={zone} onSubmit={handleReturnSubmit} onBack={handleBack} />
      )}

      {!isFinished ? (
        <GlassCard variant="soft" className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <MotionButton
              type="button"
              onClick={handleStartPause}
              className={`${buttonPrimaryClass} min-h-12 flex-1`}
            >
              {startButtonLabel}
            </MotionButton>
            <MotionButton
              type="button"
              onClick={handleReset}
              disabled={!isRunning && elapsedSeconds === 0}
              className={`${buttonSecondaryClass} min-h-12 flex-1`}
            >
              Reset
            </MotionButton>
            <MotionButton
              type="button"
              onClick={handleBack}
              className={`${buttonSecondaryClass} min-h-12 flex-1`}
            >
              {hasCheckinContext ? "Back to Check-In Tools" : fromReset ? "Back to Reset" : "Back to Tools"}
            </MotionButton>
          </div>
        </GlassCard>
      ) : null}
      </div>
    </section>
  );
}
