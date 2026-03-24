"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CHECKIN_FEELINGS,
  CHECKIN_ZONES,
  type CheckinBodyClueId,
  type CheckinFeelingId,
  type CheckinZoneId,
} from "@/lib/checkin-options";
import { type RecommendationIntent } from "@/lib/tools/recommend";
import { CalmParticles } from "@/components/animations/calm-particles";
import { JourneyShell, type JourneySummaryChip } from "@/components/checkin/journey-shell";
import { ClassroomSafeToggle } from "@/components/student/classroom-safe-toggle";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { useStudentTheme } from "@/hooks/useStudentTheme";
import { useZoneTheme } from "@/hooks/useZoneTheme";
import { getMotionPreferences } from "@/lib/motion";
import { ZoneStep } from "@/components/checkin/zone-step";
import { FeelingsStep } from "@/components/checkin/feelings-step";
import { ResetStyleStep } from "@/components/checkin/reset-style-step";
import { ReadyScreen } from "@/components/checkin/ready-screen";
import {
  BodyStep,
  createEmptyBodySelection,
  getSelectedBodyAreaLabels,
  getSelectedBodyClueIds,
  type BodySelectionState,
} from "@/components/checkin/body-step";
import type { SaveCheckinActionResult } from "@/app/(app)/students/[id]/checkin/start/actions";

type CheckinJourneyProps = {
  studentId: string;
  studentName: string;
  studentThemeKey?: string | null;
  action: (formData: FormData) => Promise<SaveCheckinActionResult>;
};

type CheckinMode = "quick" | "full";
type ResetIntent = RecommendationIntent;
type LaunchTarget = {
  intent: ResetIntent;
  toolKey: string | null;
  showAllTools: boolean;
};

const TOTAL_STEPS = 5;

const MODE_OPTIONS: Array<{ id: CheckinMode; label: string; subtitle: string }> = [
  {
    id: "quick",
    label: "Quick Check-in",
    subtitle: "Fewer choices. Keep it moving.",
  },
  {
    id: "full",
    label: "Full Check-in",
    subtitle: "More detail before you reset.",
  },
] as const;

const STEP_COPY: Record<
  number,
  {
    title: string;
    description: string;
  }
> = {
  1: {
    title: "Choose your zone",
    description: "Pick the zone that matches right now.",
  },
  2: {
    title: "Name the feeling",
    description: "Choose the vibe word that fits best.",
  },
  3: {
    title: "Notice your body",
    description: "Tap where you feel it.",
  },
  4: {
    title: "Choose your reset style",
    description: "Pick the kind of help you need next.",
  },
  5: {
    title: "Ready for your reset",
    description: "Review your choices, then start your tool.",
  },
} as const;

const RESET_INTENT_LABELS: Record<ResetIntent, string> = {
  breathe: "Breathe",
  move: "Move",
  ground: "Ground",
  support: "Get Support",
};

function normalizeIntent(value: ResetIntent): string {
  return value;
}

type AudioContextWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

function getZoneLabel(zone: CheckinZoneId | null): string | null {
  if (!zone) {
    return null;
  }

  return CHECKIN_ZONES.find((zoneOption) => zoneOption.id === zone)?.label ?? null;
}

function getFeelingLabels(feelings: CheckinFeelingId[]): string[] {
  return feelings.flatMap((feelingId) => {
    const feeling = CHECKIN_FEELINGS.find((item) => item.id === feelingId);
    return feeling ? [feeling.label] : [];
  });
}

function getCompletionMessage(options: {
  step: number;
  zone: CheckinZoneId | null;
  feelingLabels: string[];
  bodyAreaLabels: string[];
  intent: ResetIntent | null;
  launchTarget: LaunchTarget | null;
}): string | null {
  if (options.step === 1 && options.zone) {
    return "Zone selected.";
  }

  if (options.step === 2 && options.feelingLabels.length > 0) {
    return "Vibe words selected.";
  }

  if (options.step === 3 && options.bodyAreaLabels.length > 0) {
    return "Body check-in complete.";
  }

  if (options.step === 4 && options.launchTarget) {
    return "Tool path selected.";
  }

  if (options.step === 4 && options.intent) {
    return "Reset style selected.";
  }

  if (options.step === 5 && options.launchTarget) {
    return "Ready to start.";
  }

  return null;
}

export function CheckinJourney({
  studentId,
  studentName,
  studentThemeKey = null,
  action,
}: CheckinJourneyProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CheckinMode | null>(null);
  const [step, setStep] = useState(1);
  const [zone, setZone] = useState<CheckinZoneId | null>(null);
  const [feelings, setFeelings] = useState<CheckinFeelingId[]>([]);
  const [intensity, setIntensity] = useState(5);
  const [bodySelection, setBodySelection] = useState<BodySelectionState>(() =>
    createEmptyBodySelection()
  );
  const [intent, setIntent] = useState<ResetIntent | null>(null);
  const [launchTarget, setLaunchTarget] = useState<LaunchTarget | null>(null);
  const [calmMode, setCalmMode] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, startSavingTransition] = useTransition();
  const audioContextRef = useRef<AudioContext | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const studentTheme = useStudentTheme(studentThemeKey);
  const zoneTheme = useZoneTheme(zone);
  const motionPreferences = useMemo(
    () => getMotionPreferences(classroomSafeMode, Boolean(prefersReducedMotion)),
    [classroomSafeMode, prefersReducedMotion]
  );

  const stepTransition = useMemo(() => {
    if (motionPreferences.disableMotion) {
      return {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
        transition: { duration: 0 },
      };
    }

    if (classroomSafeMode) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: motionPreferences.transitionDefaults,
      };
    }

    return {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      transition: motionPreferences.transitionDefaults,
    };
  }, [classroomSafeMode, motionPreferences]);

  const maxFeelings = mode === "quick" ? 1 : 2;
  const bodyClues = useMemo<CheckinBodyClueId[]>(
    () => getSelectedBodyClueIds(bodySelection),
    [bodySelection]
  );
  const selectedBodyAreas = useMemo(
    () => getSelectedBodyAreaLabels(bodySelection),
    [bodySelection]
  );
  const feelingLabels = useMemo(() => getFeelingLabels(feelings), [feelings]);
  const progressPercent = mode ? Math.round((step / TOTAL_STEPS) * 100) : 0;

  const canContinue = useMemo(() => {
    if (!mode) {
      return false;
    }

    if (step === 1) {
      return Boolean(zone);
    }

    if (step === 2) {
      return feelings.length >= 1 && feelings.length <= maxFeelings;
    }

    if (step === 3) {
      return bodyClues.length >= 1;
    }

    if (step === 4) {
      return Boolean(intent);
    }

    if (step === 5) {
      return Boolean(launchTarget);
    }

    return false;
  }, [bodyClues.length, feelings.length, intent, launchTarget, maxFeelings, mode, step, zone]);

  const summaryChips = useMemo<JourneySummaryChip[]>(() => {
    if (!mode || step < 2) {
      return [];
    }

    const chips: JourneySummaryChip[] = [];
    const zoneLabel = getZoneLabel(zone);

    if (zoneLabel) {
      chips.push({ label: "Zone", value: zoneLabel });
    }

    if (step >= 3 && feelingLabels.length > 0) {
      chips.push({ label: "Vibes", value: feelingLabels.join(", ") });
    }

    if (step >= 4 && intent) {
      chips.push({ label: "Reset", value: RESET_INTENT_LABELS[intent] });
    }

    return chips;
  }, [feelingLabels, intent, mode, step, zone]);

  const completionMessage = useMemo(
    () =>
      getCompletionMessage({
        step,
        zone,
        feelingLabels,
        bodyAreaLabels: selectedBodyAreas,
        intent,
        launchTarget,
      }),
    [feelingLabels, intent, launchTarget, selectedBodyAreas, step, zone]
  );

  useEffect(() => {
    if (classroomSafeMode) {
      setCalmMode(false);
    }
  }, [classroomSafeMode]);

  useEffect(() => {
    return () => {
      const audioContext = audioContextRef.current;
      if (!audioContext) {
        return;
      }

      void audioContext.close();
      audioContextRef.current = null;
    };
  }, []);

  function markInteraction() {
    if (hasUserInteracted) {
      return;
    }

    setHasUserInteracted(true);
  }

  async function playStepChime() {
    if (
      classroomSafeMode ||
      !calmMode ||
      !hasUserInteracted ||
      typeof window === "undefined"
    ) {
      return;
    }

    try {
      const AudioContextConstructor =
        window.AudioContext || (window as AudioContextWindow).webkitAudioContext;

      if (!AudioContextConstructor) {
        return;
      }

      const audioContext = audioContextRef.current ?? new AudioContextConstructor();
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, start);
      oscillator.frequency.exponentialRampToValueAtTime(880, start + 0.12);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.025, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.26);
    } catch {
      return;
    }
  }

  function toggleFeeling(feelingId: CheckinFeelingId) {
    setFeelings((current) => {
      if (current.includes(feelingId)) {
        return current.filter((item) => item !== feelingId);
      }

      if (current.length >= maxFeelings) {
        return current;
      }

      return [...current, feelingId];
    });
  }

  function selectMode(nextMode: CheckinMode) {
    markInteraction();
    setMode(nextMode);
    setStep(1);
    setZone(null);
    setFeelings([]);
    setIntensity(5);
    setBodySelection(createEmptyBodySelection());
    setIntent(null);
    setLaunchTarget(null);
    setErrorMessage(null);
  }

  function handleNext() {
    markInteraction();
    if (!canContinue || step >= TOTAL_STEPS) {
      return;
    }

    setStep((current) => current + 1);
    void playStepChime();
  }

  function handleBack() {
    markInteraction();

    if (step <= 1) {
      setMode(null);
      return;
    }

    if (step === 5) {
      setLaunchTarget(null);
      setStep(4);
      return;
    }

    setStep((current) => current - 1);
  }

  function createPayloadFormData(): FormData {
    const formData = new FormData();
    formData.set("zone", zone ?? "");
    formData.set("feelings", JSON.stringify(feelings));
    formData.set("intensity", mode === "full" ? String(intensity) : "");
    formData.set("body_clues", JSON.stringify(bodyClues));
    return formData;
  }

  function navigateToTools(options: {
    checkinId: string;
    intent: ResetIntent;
    toolKey: string | null;
    showAllTools: boolean;
  }) {
    if (!zone) {
      const params = new URLSearchParams({ checkinId: options.checkinId });
      if (studentThemeKey) {
        params.set("themeKey", studentThemeKey);
      }
      router.push(`/students/${studentId}/checkin/tools?${params.toString()}`);
      return;
    }

    if (options.showAllTools || !options.toolKey) {
      const params = new URLSearchParams({
        checkinId: options.checkinId,
        studentId,
        zone,
        intent: normalizeIntent(options.intent),
      });
      if (studentThemeKey) {
        params.set("themeKey", studentThemeKey);
      }

      router.push(`/students/${studentId}/checkin/tools?${params.toString()}`);
      return;
    }

    const params = new URLSearchParams({
      checkinId: options.checkinId,
      studentId,
      from: "checkin",
      zone,
      intent: normalizeIntent(options.intent),
    });
    if (studentThemeKey) {
      params.set("themeKey", studentThemeKey);
    }

    router.push(`/tools/${options.toolKey}?${params.toString()}`);
  }

  function submitJourney(options: {
    intent: ResetIntent;
    toolKey: string | null;
    showAllTools: boolean;
  }) {
    markInteraction();
    if (!mode || isSaving) {
      return;
    }

    if (!zone) {
      setErrorMessage("Please choose a zone before continuing.");
      return;
    }

    setErrorMessage(null);
    setIntent(options.intent);
    const formData = createPayloadFormData();

    startSavingTransition(async () => {
      try {
        const result = await action(formData);
        if (!result.ok) {
          setErrorMessage(result.error);
          return;
        }

        navigateToTools({
          checkinId: result.checkinId,
          intent: options.intent,
          toolKey: options.toolKey,
          showAllTools: options.showAllTools,
        });
      } catch {
        setErrorMessage("Unable to start check-in. Please try again.");
      }
    });
  }

  function handleChooseLaunch(options: LaunchTarget) {
    markInteraction();
    setIntent(options.intent);
    setLaunchTarget(options);
    setStep(5);
    void playStepChime();
  }

  function handleStepSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleNext();
  }

  const journeyTitle = !mode ? "Choose your check-in" : STEP_COPY[step].title;
  const journeyDescription = !mode
    ? `${studentName}, start with the pace that fits best for this moment.`
    : `${studentName}, ${STEP_COPY[step].description.toLowerCase()}`;
  const eyebrow = !mode
    ? "Check-in Journey"
    : mode === "quick"
      ? "Quick Check-in"
      : "Full Check-in";

  const footer = !mode ? null : (
    <div className="space-y-3">
      {completionMessage ? (
        <p className="text-sm font-medium text-primary">{completionMessage}</p>
      ) : (
        <p className="text-sm text-gray-600">
          {step === 4
            ? "Choose a reset style, then pick a tool path."
            : "Complete this step to keep moving."}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={handleBack} className={buttonSecondaryClass}>
          {step === 1 ? "Back to mode" : "Back"}
        </button>

        {step < 4 ? (
          <button
            type="submit"
            form="checkin-journey-form"
            disabled={!canContinue}
            className={buttonPrimaryClass}
          >
            Next
          </button>
        ) : null}

        {step === 5 ? (
          <button
            type="button"
            onClick={() => {
              if (!launchTarget) {
                return;
              }
              submitJourney(launchTarget);
            }}
            disabled={!launchTarget || isSaving}
            className={buttonPrimaryClass}
          >
            {isSaving ? "Starting..." : "Start My Reset"}
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <section
      className={`app-card relative overflow-hidden p-5 shadow-sm sm:p-8 ${studentTheme.panelClassName}`}
      onPointerDownCapture={markInteraction}
    >
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
        className="absolute -right-24 top-[-5rem] z-0 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: zoneTheme.accentColor, opacity: zone ? 0.08 : 0.05 }}
      />
      <div
        className="absolute -left-20 bottom-[-5rem] z-0 h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: zoneTheme.primaryColor, opacity: zone ? 0.07 : 0.04 }}
      />
      <CalmParticles
        density="low"
        disabled={!calmMode || classroomSafeMode}
        className="z-[1] opacity-70"
      />

      <div className="relative z-10">
        <JourneyShell
          eyebrow={eyebrow}
          title={journeyTitle}
          description={journeyDescription}
          progressLabel={mode ? `Step ${step} of ${TOTAL_STEPS}` : "Choose mode"}
          progressPercent={progressPercent}
          summaryChips={summaryChips}
          contentClassName="bg-white/88"
          footer={footer}
        >
          <div className="flex flex-wrap items-center justify-end gap-2 border-b border-border-soft pb-4">
            <ClassroomSafeToggle />
            <button
              type="button"
              onClick={() => {
                markInteraction();
                if (classroomSafeMode) {
                  return;
                }
                setCalmMode((current) => !current);
              }}
              disabled={classroomSafeMode}
              title={classroomSafeMode ? "Disabled while Classroom-Safe mode is on." : undefined}
              className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-dark transition duration-[200ms] ease-out hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Calm Mode: {calmMode && !classroomSafeMode ? "On" : "Off"}
            </button>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-5">
            <AnimatePresence mode="wait">
              {!mode ? (
                <motion.div key="mode" {...stepTransition} className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {MODE_OPTIONS.map((option) => (
                      <motion.button
                        key={option.id}
                        type="button"
                        onClick={() => selectMode(option.id)}
                        whileHover={motionPreferences.hoverLift ?? undefined}
                        whileTap={motionPreferences.tapScale ?? undefined}
                        className="rounded-2xl border border-border-soft bg-white p-4 text-left shadow-sm transition duration-[250ms] ease-out hover:border-primary/40 hover:bg-primary/5"
                      >
                        <p className="text-base font-semibold text-dark">{option.label}</p>
                        <p className="mt-1 text-sm text-gray-700">{option.subtitle}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key={`step-${step}`}
                  id="checkin-journey-form"
                  {...stepTransition}
                  onSubmit={handleStepSubmit}
                  className="space-y-4"
                >
                  {step === 1 ? (
                    <ZoneStep selectedZone={zone} disabled={isSaving} onSelect={setZone} />
                  ) : null}

                  {step === 2 ? (
                    <div className="space-y-4">
                      <FeelingsStep
                        selectedFeelings={feelings}
                        maxSelections={maxFeelings}
                        onToggleFeeling={toggleFeeling}
                        disabled={isSaving}
                      />

                      {mode === "full" ? (
                        <div className="rounded-xl border border-border-soft bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <label
                              htmlFor="intensity"
                              className="text-sm font-medium text-dark"
                            >
                              Intensity
                            </label>
                            <span className="text-sm font-semibold text-primary">
                              {intensity}/10
                            </span>
                          </div>
                          <input
                            id="intensity"
                            type="range"
                            min={1}
                            max={10}
                            value={intensity}
                            onChange={(event) => setIntensity(Number(event.target.value))}
                            className="mt-3 h-2 w-full cursor-pointer accent-primary"
                          />
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {step === 3 ? (
                    <BodyStep
                      mode={mode}
                      value={bodySelection}
                      onChange={setBodySelection}
                      disabled={isSaving}
                    />
                  ) : null}

                  {step === 4 ? (
                    <ResetStyleStep
                      zone={zone}
                      mode={mode}
                      bodyClues={bodyClues}
                      selectedIntent={intent}
                      disabled={isSaving}
                      onSelectIntent={setIntent}
                      onStartTool={(toolKey, nextIntent) =>
                        handleChooseLaunch({
                          intent: nextIntent,
                          toolKey,
                          showAllTools: false,
                        })
                      }
                      onShowAllTools={(nextIntent) =>
                        handleChooseLaunch({
                          intent: nextIntent,
                          toolKey: null,
                          showAllTools: true,
                        })
                      }
                    />
                  ) : null}

                  {step === 5 ? (
                    <ReadyScreen
                      zone={zone}
                      vibeWords={feelingLabels}
                      bodyAreas={selectedBodyAreas}
                    />
                  ) : null}
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </JourneyShell>
      </div>
    </section>
  );
}
