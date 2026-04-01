"use client";

import { memo, useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Pause, Play, RefreshCw, Sparkles, Volume2 } from "lucide-react";
import { createToolUseAction } from "@/app/(app)/tools/actions";
import { CalmBackground } from "@/components/animations/calm-background";
import { ClassroomSafeToggle } from "@/components/student/classroom-safe-toggle";
import { ReturnScreen, type ReturnScreenResult } from "@/components/student/return-screen";
import { GlassCard } from "@/components/ui/glass-card";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  toolkitButtonGhostClass,
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { MotionButton } from "@/components/ui/motion-primitives";
import { ToolkitPrivacyBanner } from "@/components/ui/toolkit-privacy-banner";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { useStudentTheme } from "@/hooks/useStudentTheme";
import { useZoneTheme } from "@/hooks/useZoneTheme";
import type { AppMode } from "@/lib/app-mode";
import type { CheckinZoneId, ToolCategory } from "@/lib/checkin-options";
import { getMotionPreferences } from "@/lib/motion";
import type { ToolRuntimeProps, ToolRuntimeStatus } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

type ToolRunnerProps = {
  mode: AppMode;
  toolKey: string;
  toolCategory: ToolCategory;
  toolLabel: string;
  title: string;
  description: string;
  durationSeconds: number;
  ToolComponent: ComponentType<ToolRuntimeProps>;
  from?: string | null;
  zone?: string | null;
  intent?: string | null;
  returnTo?: string | null;
  checkinId?: string | null;
  studentId?: string | null;
  themeKey?: string | null;
};

const TOOLKIT_GUIDANCE: Record<
  ToolCategory,
  {
    eyebrow: string;
    headline: string;
    description: string;
    steps: string[];
  }
> = {
  calm_body: {
    eyebrow: "Slow + steady",
    headline: "Let the motion guide your breathing.",
    description: "There is no rush here. A softer breath and a slower pace still count.",
    steps: ["Press Start when you feel ready.", "Follow the motion or prompt.", "Pause or reset any time."],
  },
  release_energy: {
    eyebrow: "Move safely",
    headline: "Use strong energy in a helpful way.",
    description: "Big feelings are okay. This tool helps your body move them through safely.",
    steps: ["Give yourself a little space.", "Follow the movement or count.", "Pause when your body feels steadier."],
  },
  reset_mind: {
    eyebrow: "One step at a time",
    headline: "Bring your brain back to right now.",
    description: "One small prompt at a time can help busy thoughts get quieter.",
    steps: ["Press Start when you are ready.", "Notice one prompt at a time.", "Reset if you want a fresh start."],
  },
  get_support: {
    eyebrow: "You are not alone",
    headline: "Practice helpful words before you need them.",
    description: "You can read, whisper, or think the words in your head. All of that counts.",
    steps: ["Press Start when you are ready.", "Try the words out loud or in your head.", "Keep the line that feels most helpful."],
  },
};

const TOOLKIT_FINISH_COPY: Record<ToolCategory, string> = {
  calm_body: "You gave your body a calm moment. Notice one small thing that feels softer now.",
  release_energy: "You helped your body move through a big feeling. Take a second to notice what feels steadier.",
  reset_mind: "You made space for your thoughts to settle. Pick one next step that feels clear and doable.",
  get_support: "You practiced asking for help, and that matters. Keep the words that felt kind and clear.",
};

const TOOLKIT_PROGRESS_COLOR = "#4F8CFF";
const TOOLKIT_CYCLE_COLOR = "#7C6CFF";

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

type ToolRuntimeStageProps = ToolRuntimeProps & {
  ToolComponent: ComponentType<ToolRuntimeProps>;
};

const ToolRuntimeStage = memo(
  function ToolRuntimeStage({ ToolComponent, ...runtimeProps }: ToolRuntimeStageProps) {
    return <ToolComponent {...runtimeProps} />;
  },
  (previousProps, nextProps) =>
    previousProps.ToolComponent === nextProps.ToolComponent &&
    previousProps.isRunning === nextProps.isRunning &&
    previousProps.isFinished === nextProps.isFinished &&
    previousProps.elapsedSeconds === nextProps.elapsedSeconds &&
    previousProps.remainingSeconds === nextProps.remainingSeconds &&
    previousProps.durationSeconds === nextProps.durationSeconds &&
    previousProps.progressPercent === nextProps.progressPercent &&
    previousProps.onFinish === nextProps.onFinish &&
    previousProps.onStatusChange === nextProps.onStatusChange,
);

ToolRuntimeStage.displayName = "ToolRuntimeStage";

export function ToolRunner({
  mode,
  toolKey,
  toolCategory,
  toolLabel,
  title,
  description,
  durationSeconds,
  ToolComponent,
  from = null,
  zone = null,
  intent = null,
  returnTo = null,
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
  const isToolkitMode = mode === "toolkit";
  const progressColor = isToolkitMode
    ? TOOLKIT_PROGRESS_COLOR
    : normalizedZone
      ? zoneTheme.primaryColor
      : TOOLKIT_PROGRESS_COLOR;
  const cycleColor = isToolkitMode
    ? TOOLKIT_CYCLE_COLOR
    : normalizedZone
      ? zoneTheme.accentColor
      : TOOLKIT_CYCLE_COLOR;
  const toolkitGuidance = TOOLKIT_GUIDANCE[toolCategory];
  const toolkitFinishMessage = TOOLKIT_FINISH_COPY[toolCategory];
  const fromReset = from === "reset";
  const fromCheckin = from === "checkin";
  const fromGuidedCheckin = from === "check-in";
  const safeCheckinId = checkinId?.trim() ?? "";
  const safeStudentId = studentId?.trim() ?? "";
  const safeIntent = intent?.trim() ?? "";
  const hasCheckinContext =
    mode === "demo" && fromCheckin && safeCheckinId.length > 0 && safeStudentId.length > 0;
  const toolkitBackHref = from === "toolkit" ? "/toolkit" : "/tools";
  const hasGuidedReturn = isToolkitMode && fromGuidedCheckin && Boolean(returnTo?.trim());
  const defaultBackHref = fromReset ? "/reset" : toolkitBackHref;
  const checkinToolsParams = new URLSearchParams({
    checkinId: safeCheckinId,
  });
  if (zone) {
    checkinToolsParams.set("zone", zone);
  }
  if (safeIntent) {
    checkinToolsParams.set("intent", safeIntent);
  }
  const checkinToolsHref = `/students/${encodeURIComponent(
    safeStudentId,
  )}/checkin/tools?${checkinToolsParams.toString()}`;
  const checkinFinishParams = new URLSearchParams({
    checkinId: safeCheckinId,
  });
  if (zone) {
    checkinFinishParams.set("zone", zone);
  }
  if (safeIntent) {
    checkinFinishParams.set("intent", safeIntent);
  }
  const checkinFinishHref = `/students/${encodeURIComponent(
    safeStudentId,
  )}/checkin/finish?${checkinFinishParams.toString()}`;
  const [ambientSoundEnabled, setAmbientSoundEnabled] = useState(false);
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
      Math.max(current, Math.min(elapsedSeconds * 1000, durationMs)),
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
  const phaseDisplayLabel = isToolkitMode
    ? isFinished
      ? "Nice job"
      : isRunning
        ? (toolStatus?.phaseLabel ?? "Keep going")
        : elapsedSeconds === 0
          ? "Press Start when you're ready"
          : "Paused and ready"
    : phaseLabel;
  const cycleProgressPercent = Math.min(100, Math.max(0, toolStatus?.cycleProgressPercent ?? 0));
  const hasCycleProgress = typeof toolStatus?.cycleProgressPercent === "number";
  const roundedProgressPercent = Math.round(overallProgressPercent);
  const progressTransitionDurationMs = Math.round(
    motionPreferences.durations.standard * 1000,
  );
  const cycleTransitionDurationMs = Math.round(motionPreferences.durations.quick * 1000);
  const backButtonLabel = hasCheckinContext
    ? "Back to Check-In Tools"
    : hasGuidedReturn
      ? "Back to Check-In"
    : fromReset
      ? "Back to Reset"
      : from === "toolkit"
        ? "Back to Toolkit"
        : "Back to Tools";
  const startButtonLabel = elapsedSeconds === 0 ? "Start" : "Resume";
  const runnerPrimaryButtonClass = isToolkitMode ? toolkitButtonPrimaryClass : buttonPrimaryClass;
  const runnerSecondaryButtonClass = isToolkitMode
    ? toolkitButtonSecondaryClass
    : buttonSecondaryClass;
  const runnerGhostButtonClass = isToolkitMode ? toolkitButtonGhostClass : buttonSecondaryClass;
  const progressHeadline = isToolkitMode ? "Your calm progress" : "Overall progress";
  const toolkitTimerSupportText = isFinished
    ? "This round is complete."
    : elapsedSeconds === 0
      ? "The timer starts when you press Start."
      : "Stay with the pace that feels steady and calm.";
  const headerMetaRowClassName = isToolkitMode
    ? "mt-7 flex flex-wrap items-center gap-2.5"
    : "mt-6 flex flex-wrap gap-2";
  const headerMetaChipClassName = isToolkitMode
    ? "inline-flex min-h-10 items-center rounded-full border border-white/80 bg-white/84 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark shadow-[0_16px_28px_-24px_rgba(15,23,42,0.22)]"
    : "rounded-full bg-white/82 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark shadow-sm";
  const runtimeProgressPercent = useMemo(() => {
    if (durationSeconds <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((elapsedSeconds / durationSeconds) * 100));
  }, [durationSeconds, elapsedSeconds]);

  const handleToolFinish = useCallback(() => {
    setIsRunning(false);
    setIsFinished(true);
    setToolStatus((current) => ({
      ...(current ?? {}),
      phaseLabel: "Complete",
    }));
  }, []);

  const runtimeProps = useMemo<ToolRuntimeProps>(
    () => ({
      isRunning,
      isFinished,
      elapsedSeconds,
      remainingSeconds,
      durationSeconds,
      progressPercent: runtimeProgressPercent,
      onFinish: handleToolFinish,
      onStatusChange: setToolStatus,
    }),
    [
      durationSeconds,
      elapsedSeconds,
      handleToolFinish,
      isFinished,
      isRunning,
      remainingSeconds,
      runtimeProgressPercent,
    ],
  );

  function handleStart() {
    if (isFinished || isComplete) {
      setElapsedSeconds(0);
      setVisualElapsedMs(0);
      setIsFinished(false);
      setToolStatus(null);
      setHelpfulRating(null);
      setSaveError(null);
      setIsSavingToolUse(false);
    }

    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
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

  function handleToolkitRunAgain() {
    handleReset();
    setIsRunning(true);
  }

  function handleBack() {
    if (hasCheckinContext) {
      router.push(checkinToolsHref);
      return;
    }

    if (hasGuidedReturn && returnTo) {
      router.push(returnTo);
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(defaultBackHref);
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

    const destination = fromReset ? "/reset" : defaultBackHref;
    router.push(`${destination}?${params.toString()}`);
  }

  async function handleCheckinContinue() {
    if (mode !== "demo" || !hasCheckinContext || isSavingToolUse) {
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

  return (
    <>
      <section className="relative isolate min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
        {isToolkitMode ? (
          <CalmBackground variant="immersive" className="z-0" />
        ) : (
          <>
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
            <motion.div
              className="absolute inset-0 z-0 opacity-65"
              style={{
                backgroundImage: `radial-gradient(circle at 18% 22%, ${progressColor}18 0%, transparent 34%), radial-gradient(circle at 82% 18%, ${cycleColor}1a 0%, transparent 30%), radial-gradient(circle at 50% 88%, rgba(255,255,255,0.7) 0%, transparent 26%)`,
              }}
              animate={
                motionPreferences.disableMotion
                  ? undefined
                  : { backgroundPosition: ["0% 0%", "4% -3%", "-3% 4%", "0% 0%"] }
              }
              transition={
                motionPreferences.disableMotion
                  ? undefined
                  : { duration: 18, ease: "easeInOut", repeat: Infinity }
              }
            />
            <motion.div
              className="absolute -left-24 top-8 z-0 h-80 w-80 rounded-full blur-3xl"
              style={{ backgroundColor: progressColor, opacity: normalizedZone ? 0.14 : 0.12 }}
              animate={
                motionPreferences.disableMotion
                  ? undefined
                  : { x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.06, 1] }
              }
              transition={
                motionPreferences.disableMotion
                  ? undefined
                  : { duration: 16, ease: "easeInOut", repeat: Infinity }
              }
            />
            <motion.div
              className="absolute right-[-5rem] top-16 z-0 h-96 w-96 rounded-full blur-3xl"
              style={{ backgroundColor: cycleColor, opacity: normalizedZone ? 0.12 : 0.1 }}
              animate={
                motionPreferences.disableMotion
                  ? undefined
                  : { x: [0, -20, 0], y: [0, 16, 0], scale: [1.02, 1.08, 1.02] }
              }
              transition={
                motionPreferences.disableMotion
                  ? undefined
                  : { duration: 20, ease: "easeInOut", repeat: Infinity, delay: 0.4 }
              }
            />
            <motion.div
              className="absolute bottom-[-7rem] left-1/3 z-0 h-80 w-80 rounded-full bg-white/70 blur-3xl"
              animate={
                motionPreferences.disableMotion
                  ? undefined
                  : { x: [0, 14, 0], y: [0, -24, 0], scale: [1, 1.04, 1] }
              }
              transition={
                motionPreferences.disableMotion
                  ? undefined
                  : { duration: 22, ease: "easeInOut", repeat: Infinity, delay: 0.8 }
              }
            />
          </>
        )}

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col justify-center gap-6 sm:gap-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <MotionButton
              type="button"
              onClick={handleBack}
              className={`${runnerGhostButtonClass} gap-2 px-4 font-semibold`}
            >
              <ChevronLeft className="h-4 w-4" />
              {backButtonLabel}
            </MotionButton>
          </div>

          <GlassCard
            variant="soft"
            accent
            className="overflow-hidden rounded-[2.5rem] border-white/55 bg-white/64 p-6 shadow-glass sm:p-8 lg:p-12"
          >
            <div className="gradient-accent pointer-events-none absolute inset-0 opacity-60" />
            <div className="pointer-events-none absolute left-0 top-0 h-36 w-36 rounded-full bg-white/65 blur-3xl" />
            <div className="pointer-events-none absolute right-10 top-10 h-44 w-44 rounded-full bg-secondary/14 blur-3xl" />

            <div
              className={`relative grid gap-8 lg:grid-cols-[1.12fr_0.88fr] ${
                isToolkitMode ? "lg:items-start lg:gap-10" : "lg:items-center"
              }`}
            >
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark/80">
                  {isToolkitMode ? toolkitGuidance.eyebrow : "Guided Tool"}
                </p>
                <h1
                  className={`text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.92] tracking-[-0.05em] text-dark ${
                    isToolkitMode ? "mt-3" : "mt-4"
                  }`}
                >
                  {title}
                </h1>
                <p
                  className={`max-w-2xl text-base leading-8 text-slate-600 sm:text-lg ${
                    isToolkitMode ? "mt-5" : "mt-4"
                  }`}
                >
                  {description}
                </p>
                <p className={`toolkit-body-copy max-w-2xl ${isToolkitMode ? "mt-5" : "mt-4"}`}>
                  {isToolkitMode
                    ? toolkitGuidance.headline
                    : "Settle in, follow the prompts, and take this at the pace that feels right."}
                </p>

                <div className={headerMetaRowClassName}>
                  <span className={headerMetaChipClassName}>
                    {formatClock(durationSeconds)} session
                  </span>
                  <span className={headerMetaChipClassName}>
                    {phaseDisplayLabel}
                  </span>
                  {toolStatus?.cycleLabel ? (
                    <span className={headerMetaChipClassName}>
                      Cycle {toolStatus.cycleLabel}
                    </span>
                  ) : null}
                </div>

                {isToolkitMode ? (
                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {toolkitGuidance.steps.map((step, index) => (
                      <div
                        key={step}
                        className="toolkit-panel px-4 py-4 text-sm leading-6 text-slate-600"
                      >
                        <span className="mr-2 font-semibold text-primary-dark">{index + 1}.</span>
                        {step}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              {isToolkitMode ? (
                <div className="w-full max-w-[28rem] lg:justify-self-end">
                  <div className="toolkit-panel-strong relative overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px gradient-accent opacity-80" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,245,255,0.86))]" />
                    <div className="pointer-events-none absolute inset-x-10 bottom-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(79,140,255,0.08))]" />

                    <div className="relative">
                      <p className="toolkit-eyebrow text-primary-dark/70">Time Left</p>
                      <p className="mt-4 text-[clamp(3.15rem,8vw,4.85rem)] font-semibold leading-none tracking-[-0.08em] text-dark">
                        {formatClock(remainingSeconds)}
                      </p>
                      <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                        {toolkitTimerSupportText}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-stretch gap-3">
                    <button
                      type="button"
                      onClick={() => setAmbientSoundEnabled((current) => !current)}
                      aria-label="Toggle ambient sound"
                      aria-pressed={ambientSoundEnabled}
                      className={cn(
                        "toolkit-focus-ring inline-flex min-h-12 flex-1 items-center gap-3 rounded-full border px-4 py-3 text-left transition duration-[250ms] ease-out",
                        ambientSoundEnabled
                          ? "border-primary/30 bg-primary/10 shadow-[0_18px_34px_-24px_rgba(79,140,255,0.28)] hover:-translate-y-0.5 hover:bg-primary/12"
                          : "border-white/80 bg-white/84 shadow-[0_18px_32px_-26px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:bg-white",
                      )}
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          ambientSoundEnabled ? "bg-primary text-white" : "bg-primary/10 text-primary-dark"
                        }`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-dark">Ambient Sound</span>
                        <span className="block text-xs uppercase tracking-[0.16em] text-slate-600">
                          No audio yet
                        </span>
                      </span>
                    </button>
                    <ClassroomSafeToggle variant="pill" className="flex-1" />
                  </div>

                  <div className="toolkit-panel relative mt-4 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="toolkit-eyebrow text-primary-dark/65">Progress</p>
                        <p className="mt-1 text-sm font-semibold text-dark">{progressHeadline}</p>
                      </div>
                      <span className="text-2xl font-semibold tracking-[-0.05em] text-dark">
                        {roundedProgressPercent}%
                      </span>
                    </div>
                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/85">
                      <div
                        className="h-full rounded-full transition-all ease-out"
                        style={{
                          width: `${overallProgressPercent}%`,
                          backgroundColor: progressColor,
                          transitionDuration: `${progressTransitionDurationMs}ms`,
                        }}
                        aria-hidden
                      />
                    </div>

                    {hasCycleProgress ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                          <span>Cycle progress</span>
                          <span>{Math.round(cycleProgressPercent)}%</span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                          <div
                            className="h-full rounded-full transition-all ease-out"
                            style={{
                              width: `${cycleProgressPercent}%`,
                              backgroundColor: cycleColor,
                              transitionDuration: `${cycleTransitionDurationMs}ms`,
                            }}
                            aria-hidden
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      <span>Elapsed {formatClock(displayElapsedSeconds)}</span>
                      <span>Remaining {formatClock(remainingSeconds)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative flex h-[18rem] w-[18rem] items-center justify-center sm:h-[20rem] sm:w-[20rem]">
                    <motion.div
                      className="absolute h-full w-full rounded-full border border-primary/18 bg-white/20"
                      animate={
                        motionPreferences.disableMotion
                          ? undefined
                          : { scale: [0.96, 1.02, 0.96], opacity: [0.6, 0.85, 0.6] }
                      }
                      transition={
                        motionPreferences.disableMotion
                          ? undefined
                          : { duration: 10, ease: "easeInOut", repeat: Infinity }
                      }
                    />
                    <motion.div
                      className="absolute h-[76%] w-[76%] rounded-full border border-secondary/25"
                      animate={
                        motionPreferences.disableMotion
                          ? undefined
                          : { scale: [0.78, 1.08, 1.08, 0.78] }
                      }
                      transition={
                        motionPreferences.disableMotion
                          ? undefined
                          : {
                              duration: 11,
                              repeat: Infinity,
                              ease: "easeInOut",
                              times: [0, 0.32, 0.54, 1],
                            }
                      }
                    />
                    <motion.div
                      className="absolute h-[58%] w-[58%] rounded-full border border-accent/30"
                      animate={
                        motionPreferences.disableMotion
                          ? undefined
                          : { scale: [0.82, 1.12, 1.12, 0.82] }
                      }
                      transition={
                        motionPreferences.disableMotion
                          ? undefined
                          : {
                              duration: 11,
                              repeat: Infinity,
                              ease: "easeInOut",
                              times: [0, 0.32, 0.54, 1],
                            }
                      }
                    />
                    <motion.div
                      className="gradient-accent absolute h-[40%] w-[40%] rounded-full shadow-[0_24px_64px_-28px_rgba(79,140,255,0.48)]"
                      animate={
                        motionPreferences.disableMotion
                          ? undefined
                          : { scale: [0.8, 1.14, 1.14, 0.8] }
                      }
                      transition={
                        motionPreferences.disableMotion
                          ? undefined
                          : {
                              duration: 11,
                              repeat: Infinity,
                              ease: "easeInOut",
                              times: [0, 0.32, 0.54, 1],
                            }
                      }
                    />

                    <div className="relative z-10 rounded-full border border-white/75 bg-white/82 px-8 py-7 text-center shadow-lg backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-dark/80">
                        Time Left
                      </p>
                      <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-dark sm:text-5xl">
                        {formatClock(remainingSeconds)}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">{phaseDisplayLabel}</p>
                    </div>
                  </div>

                  <div className="flex w-full flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setAmbientSoundEnabled((current) => !current)}
                      aria-pressed={ambientSoundEnabled}
                      className="toolkit-focus-ring inline-flex min-h-12 w-full items-center gap-3 rounded-full border border-white/80 bg-white/82 px-4 py-3 text-left shadow-sm transition duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-white sm:w-auto"
                    >
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          ambientSoundEnabled ? "bg-primary text-white" : "bg-primary/10 text-primary-dark"
                        }`}
                      >
                        <Volume2 className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-dark">Ambient Sound</span>
                        <span className="block text-xs uppercase tracking-[0.16em] text-slate-500">
                          No audio yet
                        </span>
                      </span>
                    </button>
                    <ClassroomSafeToggle />
                  </div>
                </div>
              )}
            </div>

            {!isToolkitMode ? (
              <div className="toolkit-panel relative mt-8 p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-600">
                  <span>{progressHeadline}</span>
                  <span>{roundedProgressPercent}%</span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/85">
                  <div
                    className="h-full rounded-full transition-all ease-out"
                    style={{
                      width: `${overallProgressPercent}%`,
                      backgroundColor: progressColor,
                      transitionDuration: `${progressTransitionDurationMs}ms`,
                    }}
                    aria-hidden
                  />
                </div>

                {hasCycleProgress ? (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <span>Cycle progress</span>
                      <span>{Math.round(cycleProgressPercent)}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
                      <div
                        className="h-full rounded-full transition-all ease-out"
                        style={{
                          width: `${cycleProgressPercent}%`,
                          backgroundColor: cycleColor,
                          transitionDuration: `${cycleTransitionDurationMs}ms`,
                        }}
                        aria-hidden
                      />
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <span>Elapsed {formatClock(displayElapsedSeconds)}</span>
                  <span>Remaining {formatClock(remainingSeconds)}</span>
                </div>
              </div>
            ) : null}
          </GlassCard>

          {!isFinished ? (
            isToolkitMode ? (
              <>
                <div className="mx-auto w-full max-w-5xl">
                  <div className="mx-auto max-w-3xl text-center">
                    <p className="toolkit-eyebrow">Tool Space</p>
                    <h2 className="mt-3 text-2xl tracking-[-0.03em] text-dark sm:text-3xl">
                      Stay with the pace that feels right
                    </h2>
                    <p className="toolkit-body-copy mx-auto mt-3 max-w-2xl">
                      Start when you are ready, pause whenever you need to, and reset for a fresh
                      start any time.
                    </p>
                  </div>

                  <div className="toolkit-surface-level-2 relative mt-7 overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(79,140,255,0.08),transparent)]" />
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/84" />
                    <div className="pointer-events-none absolute inset-x-12 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(79,140,255,0.04))]" />

                    <div className="relative mx-auto flex min-h-[400px] w-full max-w-4xl items-center justify-center sm:min-h-[420px]">
                      <div className="w-full">
                        <ToolRuntimeStage ToolComponent={ToolComponent} {...runtimeProps} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="toolkit-surface-level-3 mx-auto w-full max-w-4xl p-3 sm:p-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MotionButton
                      type="button"
                      onClick={handleStart}
                      disabled={isRunning}
                      className={`${runnerPrimaryButtonClass} min-h-12 w-full gap-2 disabled:opacity-55`}
                    >
                      <Play className="h-4 w-4" />
                      {startButtonLabel}
                    </MotionButton>
                    <MotionButton
                      type="button"
                      onClick={handlePause}
                      disabled={!isRunning}
                      className={`${runnerSecondaryButtonClass} min-h-12 w-full gap-2 disabled:opacity-55`}
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </MotionButton>
                    <MotionButton
                      type="button"
                      onClick={handleReset}
                      disabled={!isRunning && elapsedSeconds === 0}
                      className={`${runnerSecondaryButtonClass} min-h-12 w-full gap-2 disabled:opacity-55`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </MotionButton>
                    <MotionButton
                      type="button"
                      onClick={handleBack}
                      className={`${runnerGhostButtonClass} min-h-12 w-full gap-2`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </MotionButton>
                  </div>
                </div>
              </>
            ) : (
              <>
                <GlassCard
                  variant="default"
                  accent
                  className="mx-auto w-full max-w-5xl overflow-hidden rounded-[2.4rem] border-white/60 bg-white/68 p-4 shadow-glass sm:p-6 lg:p-8"
                >
                  <div className="gradient-accent pointer-events-none absolute inset-x-0 top-0 h-24 opacity-55" />
                  <div className="relative text-center">
                    <p className="toolkit-eyebrow">
                      Tool Space
                    </p>
                    <h2 className="mt-3 text-2xl tracking-[-0.03em] text-dark sm:text-3xl">
                      Use the tool in a calm, focused space
                    </h2>
                    <p className="toolkit-body-copy mx-auto mt-3 max-w-2xl">
                      Follow the prompts at your own pace. You can start, pause, or reset the tool
                      whenever you need to.
                    </p>
                  </div>

                  <div className="relative mx-auto mt-8 flex min-h-[420px] w-full max-w-4xl items-center justify-center">
                    <motion.div
                      className="pointer-events-none absolute h-[26rem] w-[26rem] rounded-full border border-primary/12"
                      animate={
                        motionPreferences.disableMotion
                          ? undefined
                          : { scale: [0.96, 1.02, 0.96], opacity: [0.45, 0.7, 0.45] }
                      }
                      transition={
                        motionPreferences.disableMotion
                          ? undefined
                          : { duration: 12, ease: "easeInOut", repeat: Infinity }
                      }
                    />
                    <motion.div
                      className="pointer-events-none absolute h-[18rem] w-[18rem] rounded-full bg-primary/8 blur-3xl"
                      animate={
                        motionPreferences.disableMotion
                          ? undefined
                          : { scale: [0.9, 1.12, 0.9], opacity: [0.18, 0.3, 0.18] }
                      }
                      transition={
                        motionPreferences.disableMotion
                          ? undefined
                          : { duration: 9, ease: "easeInOut", repeat: Infinity }
                      }
                    />
                    <div className="relative z-10 w-full">
                      <ToolRuntimeStage ToolComponent={ToolComponent} {...runtimeProps} />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard
                  variant="soft"
                  className="mx-auto w-full max-w-4xl overflow-hidden rounded-[2.1rem] border-white/60 bg-white/74 p-3 shadow-glass sm:p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MotionButton
                      type="button"
                      onClick={handleStart}
                      disabled={isRunning}
                      className={`${runnerPrimaryButtonClass} min-h-12 w-full gap-2 disabled:opacity-55`}
                    >
                      <Play className="h-4 w-4" />
                      {startButtonLabel}
                    </MotionButton>
                    <MotionButton
                      type="button"
                      onClick={handlePause}
                      disabled={!isRunning}
                      className={`${runnerSecondaryButtonClass} min-h-12 w-full gap-2 disabled:opacity-55`}
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </MotionButton>
                    <MotionButton
                      type="button"
                      onClick={handleReset}
                      disabled={!isRunning && elapsedSeconds === 0}
                      className={`${runnerSecondaryButtonClass} min-h-12 w-full gap-2 disabled:opacity-55`}
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </MotionButton>
                    <MotionButton
                      type="button"
                      onClick={handleBack}
                      className={`${runnerGhostButtonClass} min-h-12 w-full gap-2`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </MotionButton>
                  </div>
                </GlassCard>
              </>
            )
          ) : isToolkitMode ? (
            <GlassCard
              variant="soft"
              accent
              className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2.4rem] border-white/60 bg-white/70 p-6 text-center shadow-glass sm:p-8"
            >
              <div className="gradient-accent pointer-events-none absolute inset-0 opacity-55" />
              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/84 text-primary-dark shadow-md">
                  <Sparkles className="h-7 w-7" />
                </div>
                <p className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-dark">Nice job</p>
                <p className="toolkit-body-copy mx-auto mt-4 max-w-2xl">
                  {toolkitFinishMessage}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <MotionButton
                    type="button"
                    onClick={handleToolkitRunAgain}
                    className={`${runnerPrimaryButtonClass} min-h-12 min-w-40`}
                  >
                    Run Again
                  </MotionButton>
                  {hasGuidedReturn && returnTo ? (
                    <MotionButton
                      type="button"
                      onClick={() => router.push(returnTo)}
                      className={`${runnerGhostButtonClass} min-h-12 min-w-40`}
                    >
                      Continue to More Strategies
                    </MotionButton>
                  ) : (
                    <MotionButton
                      type="button"
                      onClick={() => router.push(defaultBackHref)}
                      className={`${runnerGhostButtonClass} min-h-12 min-w-40`}
                    >
                      {from === "toolkit" ? "Back to Toolkit" : "Back to Tools"}
                    </MotionButton>
                  )}
                </div>
              </div>
            </GlassCard>
          ) : hasCheckinContext ? (
            <GlassCard
              variant="soft"
              accent
              className="mx-auto w-full max-w-2xl overflow-hidden rounded-[2.2rem] border-white/60 bg-white/72 p-6 text-center shadow-glass sm:p-8"
            >
              <div className="gradient-accent pointer-events-none absolute inset-0 opacity-50" />
              <div className="relative">
                <p className="text-3xl font-semibold tracking-[-0.04em] text-dark">Nice job</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  You finished this tool. Choose how helpful it felt, then continue the check-in.
                </p>

                <div className="mt-6 text-left">
                  <p className="text-sm font-semibold text-dark">How helpful was this tool? (Optional)</p>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setHelpfulRating(value)}
                        className={`min-h-11 rounded-2xl border text-sm font-semibold transition duration-[250ms] ease-out ${
                          helpfulRating === value
                            ? "border-primary bg-primary/12 text-primary-dark shadow-sm"
                            : "border-white/80 bg-white/82 text-dark hover:-translate-y-0.5 hover:bg-white"
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
                {saveError ? <p className="mt-3 text-sm text-slate-600">{saveError}</p> : null}
              </div>
            </GlassCard>
          ) : (
            <ReturnScreen zone={zone} onSubmit={handleReturnSubmit} onBack={handleBack} />
          )}

          <ToolkitPrivacyBanner
            visible={isToolkitMode}
            variant="inline"
            className="mx-auto mt-3"
          />
        </div>
      </section>
    </>
  );
}
