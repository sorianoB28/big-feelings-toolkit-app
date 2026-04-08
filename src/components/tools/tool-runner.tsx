"use client";

import { memo, useCallback, useEffect, useMemo, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, Pause, Play, RefreshCw, Sparkles } from "lucide-react";
import { createToolUseAction } from "@/app/(app)/tools/actions";
import { CalmBackground } from "@/components/animations/calm-background";
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
import { ProgressBar, normalizeProgressValue } from "@/components/ui/ProgressBar";
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
  hasProgress: boolean;
  ToolComponent: ComponentType<ToolRuntimeProps>;
  from?: string | null;
  zone?: string | null;
  intent?: string | null;
  backTo?: string | null;
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
    steps: [
      "Press Start when you feel ready.",
      "Follow the motion or prompt.",
      "Pause or reset any time.",
    ],
  },
  release_energy: {
    eyebrow: "Move safely",
    headline: "Use strong energy in a helpful way.",
    description: "Big feelings are okay. This tool helps your body move them through safely.",
    steps: [
      "Give yourself a little space.",
      "Follow the movement or count.",
      "Pause when your body feels steadier.",
    ],
  },
  reset_mind: {
    eyebrow: "One step at a time",
    headline: "Bring your brain back to right now.",
    description: "One small prompt at a time can help busy thoughts get quieter.",
    steps: [
      "Press Start when you are ready.",
      "Notice one prompt at a time.",
      "Reset if you want a fresh start.",
    ],
  },
  get_support: {
    eyebrow: "You are not alone",
    headline: "Practice helpful words before you need them.",
    description: "You can read, whisper, or think the words in your head. All of that counts.",
    steps: [
      "Press Start when you are ready.",
      "Try the words out loud or in your head.",
      "Keep the line that feels most helpful.",
    ],
  },
};

const TOOLKIT_FINISH_COPY: Record<ToolCategory, string> = {
  calm_body: "You gave your body a calm moment. Notice one small thing that feels softer now.",
  release_energy:
    "You helped your body move through a big feeling. Take a second to notice what feels steadier.",
  reset_mind:
    "You made space for your thoughts to settle. Pick one next step that feels clear and doable.",
  get_support:
    "You practiced asking for help, and that matters. Keep the words that felt kind and clear.",
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
    previousProps.checkinId === nextProps.checkinId &&
    previousProps.onFinish === nextProps.onFinish &&
    previousProps.onStatusChange === nextProps.onStatusChange
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
  hasProgress,
  ToolComponent,
  from = null,
  zone = null,
  intent = null,
  backTo = null,
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
  const guidedBackHref = backTo?.trim() || "/check-in/reset-tool";
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
    safeStudentId
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
    safeStudentId
  )}/checkin/finish?${checkinFinishParams.toString()}`;
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

    setVisualElapsedMs((current) => Math.max(current, Math.min(elapsedSeconds * 1000, durationMs)));
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
      if (toolStatus?.holdFinish) {
        return;
      }

      setIsFinished(true);
    }
  }, [isComplete, isFinished, toolStatus?.holdFinish]);

  const overallProgressPercent = useMemo(() => {
    if (typeof toolStatus?.progressPercent === "number") {
      return Math.min(100, Math.max(0, toolStatus.progressPercent));
    }

    if (durationMs <= 0) {
      return 0;
    }

    return Math.min(100, (clampedVisualElapsedMs / durationMs) * 100);
  }, [clampedVisualElapsedMs, durationMs, toolStatus?.progressPercent]);

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
  const displayedOverallProgressPercent = normalizeProgressValue(overallProgressPercent);
  const startButtonLabel = elapsedSeconds === 0 ? "Start" : "Resume";
  const runnerPrimaryButtonClass = isToolkitMode ? toolkitButtonPrimaryClass : buttonPrimaryClass;
  const runnerSecondaryButtonClass = isToolkitMode
    ? toolkitButtonSecondaryClass
    : buttonSecondaryClass;
  const runnerGhostButtonClass = isToolkitMode ? toolkitButtonGhostClass : buttonSecondaryClass;
  const progressHeadline = isToolkitMode ? "Your calm progress" : "Overall progress";
  const runtimeProgressPercent = useMemo(() => {
    if (durationSeconds <= 0) {
      return 0;
    }

    return Math.min(100, Math.round((elapsedSeconds / durationSeconds) * 100));
  }, [durationSeconds, elapsedSeconds]);
  const displayedCyclePercent = hasCycleProgress ? normalizeProgressValue(cycleProgressPercent) : 0;
  const cycleSummaryLabel = hasCycleProgress
    ? (toolStatus?.cycleLabel ?? "Cycle progress")
    : elapsedSeconds === 0
      ? "Ready"
      : phaseLabel;
  const headerSummaryItems = [
    { label: "Session", value: formatClock(durationSeconds) },
    { label: "Status", value: phaseDisplayLabel },
    { label: "Time left", value: formatClock(remainingSeconds) },
    ...(hasProgress && toolStatus?.cycleLabel
      ? [{ label: "Cycle", value: toolStatus.cycleLabel }]
      : []),
  ];

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
      checkinId: safeCheckinId || null,
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
      safeCheckinId,
    ]
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
      router.push(guidedBackHref);
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

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-4 sm:gap-5">
          <GlassCard
            variant="soft"
            accent
            className="overflow-hidden rounded-[2.35rem] border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(243,247,255,0.64),rgba(244,241,255,0.6))] p-3 shadow-glass sm:p-4 lg:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.78),transparent_36%),radial-gradient(circle_at_82%_18%,rgba(124,108,255,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_55%)]" />
            <div className="relative overflow-hidden rounded-[1.95rem] border border-white/75 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.98),rgba(240,247,255,0.9)_38%,rgba(245,243,255,0.78)_100%)] px-5 py-6 shadow-[0_28px_60px_-42px_rgba(79,140,255,0.28)] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),transparent)]" />
              <div className="pointer-events-none absolute -left-8 top-0 h-28 w-28 rounded-full bg-white/70 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-secondary/10 blur-3xl" />

              <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.78fr)] lg:items-start lg:gap-7">
                <div className="min-w-0 space-y-5">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-dark/75">
                      {isToolkitMode ? toolkitGuidance.eyebrow : "Guided Tool"}
                    </p>
                    <h1 className="max-w-3xl text-balance text-[clamp(2.15rem,5vw,4rem)] leading-[0.94] tracking-[-0.05em] text-dark">
                      {title}
                    </h1>
                  </div>

                  <div className="max-w-2xl space-y-3.5">
                    <p className="text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
                    <p className="toolkit-body-copy">
                      {isToolkitMode
                        ? toolkitGuidance.headline
                        : "Settle in, follow the prompts, and take this at the pace that feels right."}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-stretch gap-2.5 sm:gap-3">
                    {headerSummaryItems.map((item) => (
                      <div
                        key={item.label}
                        className="bg-white/72 min-h-11 min-w-[9.5rem] rounded-[1.2rem] border border-white/75 px-4 py-2.5 shadow-[0_14px_28px_-26px_rgba(15,23,42,0.22)]"
                      >
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-5 text-dark">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {isToolkitMode ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-3">
                      {toolkitGuidance.steps.map((step, index) => (
                        <div
                          key={step}
                          className="bg-white/72 min-h-[7.5rem] rounded-[1.35rem] border border-white/75 px-4 py-3.5 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.2)] backdrop-blur"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark/70">
                            Step {index + 1}
                          </p>
                          <p className="mt-2.5 text-sm leading-6 text-slate-600">{step}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/72 inline-flex max-w-2xl items-center rounded-[1.2rem] border border-white/75 px-4 py-3 text-sm font-medium leading-6 text-slate-600 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.24)]">
                      Follow the prompt, then use the controls below whenever you need them.
                    </div>
                  )}
                </div>

                <div className="relative overflow-hidden rounded-[1.7rem] border border-white/80 bg-[linear-gradient(165deg,rgba(255,255,255,0.88),rgba(244,248,255,0.8),rgba(244,241,255,0.76))] p-4 shadow-[0_24px_48px_-36px_rgba(79,140,255,0.24)] backdrop-blur sm:p-5">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent)]" />
                  <div className="bg-secondary/12 pointer-events-none absolute -right-10 top-6 h-28 w-28 rounded-full blur-3xl" />

                  <div className="relative">
                    <div className="rounded-[1.35rem] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.86),rgba(243,248,255,0.82),rgba(240,236,255,0.74))] p-4 shadow-[0_18px_40px_-34px_rgba(79,140,255,0.26)]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-primary-dark/72 text-xs font-semibold uppercase tracking-[0.2em]">
                            Session snapshot
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            A quick view of where this session is right now.
                          </p>
                        </div>
                        <div className="bg-white/72 rounded-full border border-white/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.18)]">
                          Live
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.25rem] border border-white/80 bg-[linear-gradient(135deg,rgba(79,140,255,0.12),rgba(124,108,255,0.1),rgba(255,255,255,0.86))] px-4 py-4 shadow-[0_16px_30px_-28px_rgba(79,140,255,0.24)]">
                        <p className="text-primary-dark/72 text-[11px] font-semibold uppercase tracking-[0.18em]">
                          Time left
                        </p>
                        <p className="mt-2 text-[1.75rem] font-semibold tracking-[-0.04em] text-dark">
                          {formatClock(remainingSeconds)}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Stay with the prompt. Pause or reset any time.
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
                        {headerSummaryItems
                          .filter((item) => item.label !== "Time left")
                          .map((item) => (
                            <div
                              key={item.label}
                              className="bg-white/74 flex min-h-[4.15rem] items-center justify-between gap-4 rounded-[1.1rem] border border-white/75 px-4 py-3 shadow-[0_14px_32px_-28px_rgba(15,23,42,0.18)]"
                            >
                              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {item.label}
                              </span>
                              <span className="max-w-[11rem] text-right text-sm font-semibold leading-6 text-dark">
                                {item.value}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/75 bg-[linear-gradient(135deg,rgba(79,140,255,0.07),rgba(124,108,255,0.08),rgba(255,255,255,0.84))] px-4 py-4">
                      <p className="text-primary-dark/72 text-[11px] font-semibold uppercase tracking-[0.18em]">
                        {isToolkitMode ? "Approach" : "Pacing"}
                      </p>
                      <p className="mt-2.5 text-sm leading-6 text-slate-600">
                        {isToolkitMode
                          ? toolkitGuidance.description
                          : "Take this one prompt at a time. Pause or reset any time without losing your place."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {!isFinished ? (
            <>
              {isToolkitMode ? (
                <div className="toolkit-surface-level-2 relative mx-auto w-full max-w-5xl overflow-hidden px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(79,140,255,0.08),transparent)]" />
                  <div className="bg-white/84 pointer-events-none absolute inset-x-8 top-0 h-px" />
                  <div className="pointer-events-none absolute inset-x-12 bottom-0 h-16 bg-[linear-gradient(180deg,transparent,rgba(79,140,255,0.04))]" />

                  <div className="relative mx-auto flex min-h-[360px] w-full max-w-4xl items-center justify-center sm:min-h-[400px]">
                    <div className="w-full">
                      <ToolRuntimeStage ToolComponent={ToolComponent} {...runtimeProps} />
                    </div>
                  </div>
                </div>
              ) : (
                <GlassCard
                  variant="default"
                  accent
                  className="bg-white/68 mx-auto w-full max-w-5xl overflow-hidden rounded-[2.4rem] border-white/60 p-4 shadow-glass sm:p-6 lg:p-8"
                >
                  <div className="gradient-accent pointer-events-none absolute inset-x-0 top-0 h-24 opacity-55" />
                  <div className="relative mx-auto flex min-h-[360px] w-full max-w-4xl items-center justify-center sm:min-h-[400px]">
                    <motion.div
                      className="border-primary/12 pointer-events-none absolute h-[26rem] w-[26rem] rounded-full border"
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
                      className="bg-primary/8 pointer-events-none absolute h-[18rem] w-[18rem] rounded-full blur-3xl"
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
              )}

              {hasProgress ? (
                <div
                  className={cn(
                    "mx-auto w-full max-w-5xl",
                    isToolkitMode && "toolkit-surface-level-3 p-3 sm:p-4"
                  )}
                >
                  <div
                    className={cn(
                      "bg-white/84 grid min-h-[74px] w-full grid-cols-[minmax(0,1fr)_84px_112px] items-center gap-3 overflow-hidden rounded-[1.75rem] border border-white/70 p-3 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.28)] backdrop-blur sm:min-h-[78px] sm:gap-4 sm:px-4",
                      isToolkitMode &&
                        "bg-white/88 border-white/80 shadow-[0_24px_48px_-34px_rgba(79,140,255,0.24)]"
                    )}
                  >
                    <div className="min-w-0">
                      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        <span className="truncate">{progressHeadline}</span>
                        <span className="hidden whitespace-nowrap sm:inline">
                          {formatClock(displayElapsedSeconds)} / {formatClock(durationSeconds)}
                        </span>
                      </div>
                      <ProgressBar
                        value={displayedOverallProgressPercent}
                        animated={!motionPreferences.disableMotion}
                        className="h-3 bg-slate-200/85"
                      />
                      <p className="mt-2 text-[11px] font-medium text-slate-500 sm:hidden">
                        {formatClock(displayElapsedSeconds)} / {formatClock(durationSeconds)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-slate-50/90 px-3 py-2 text-center shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Done
                      </p>
                      <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-dark">
                        {displayedOverallProgressPercent}%
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/70 bg-slate-50/90 px-3 py-2 text-center shadow-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Cycle
                      </p>
                      <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-dark">
                        {displayedCyclePercent}%
                      </p>
                      <ProgressBar
                        value={displayedCyclePercent}
                        animated={!motionPreferences.disableMotion}
                        className="mt-1.5 h-1.5 bg-slate-200/85"
                      />
                      <p className="mt-1 truncate text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                        {cycleSummaryLabel}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div
                className={cn(
                  "mx-auto w-full max-w-5xl",
                  isToolkitMode && "toolkit-surface-level-3 p-3 sm:p-4"
                )}
              >
                <div
                  className={cn(
                    "grid gap-3 rounded-[1.9rem] border border-white/70 bg-white/80 p-3 shadow-[0_24px_48px_-32px_rgba(15,23,42,0.28)] backdrop-blur sm:grid-cols-2 sm:p-4 xl:grid-cols-4",
                    isToolkitMode &&
                      "bg-white/88 border-white/80 shadow-[0_24px_48px_-34px_rgba(79,140,255,0.24)]"
                  )}
                >
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
          ) : isToolkitMode ? (
            <GlassCard
              variant="soft"
              accent
              className="mx-auto w-full max-w-3xl overflow-hidden rounded-[2.4rem] border-white/60 bg-white/70 p-6 text-center shadow-glass sm:p-8"
            >
              <div className="gradient-accent pointer-events-none absolute inset-0 opacity-55" />
              <div className="relative">
                <div className="bg-white/84 mx-auto flex h-16 w-16 items-center justify-center rounded-full text-primary-dark shadow-md">
                  <Sparkles className="h-7 w-7" />
                </div>
                <p className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-dark">Nice job</p>
                <p className="toolkit-body-copy mx-auto mt-4 max-w-2xl">{toolkitFinishMessage}</p>
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
              className="bg-white/72 mx-auto w-full max-w-2xl overflow-hidden rounded-[2.2rem] border-white/60 p-6 text-center shadow-glass sm:p-8"
            >
              <div className="gradient-accent pointer-events-none absolute inset-0 opacity-50" />
              <div className="relative">
                <p className="text-3xl font-semibold tracking-[-0.04em] text-dark">Nice job</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  You finished this tool. Choose how helpful it felt, then continue the check-in.
                </p>

                <div className="mt-6 text-left">
                  <p className="text-sm font-semibold text-dark">
                    How helpful was this tool? (Optional)
                  </p>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setHelpfulRating(value)}
                        className={`min-h-11 rounded-2xl border text-sm font-semibold transition duration-[250ms] ease-out ${
                          helpfulRating === value
                            ? "bg-primary/12 border-primary text-primary-dark shadow-sm"
                            : "bg-white/82 border-white/80 text-dark hover:-translate-y-0.5 hover:bg-white"
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

          <ToolkitPrivacyBanner visible={isToolkitMode} variant="inline" className="mx-auto mt-3" />
        </div>
      </section>
    </>
  );
}
