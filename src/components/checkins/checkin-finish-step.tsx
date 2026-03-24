"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type FormEvent, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MotionCard } from "@/components/animations/motion-card";
import {
  JourneyShell,
  type JourneySummaryChip,
} from "@/components/checkin/journey-shell";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputBaseClass,
} from "@/components/ui/form-styles";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { cn } from "@/lib/utils";
import type { CloseStudentCheckinActionResult } from "@/app/(app)/students/[id]/checkin/finish/actions";

type ReturnStepType =
  | "sit_down"
  | "open_notebook"
  | "start_assignment"
  | "raise_hand_for_help"
  | "sip_of_water"
  | "other";

type ReturnStepOption = {
  type: ReturnStepType;
  label: string;
  description: string;
};

type ReadinessOptionId = "yes" | "a_little" | "not_yet";

type ReadinessOption = {
  id: ReadinessOptionId;
  label: string;
  description: string;
};

type CheckinFinishRecap = {
  zoneLabel: string | null;
  toolLabel: string | null;
  helpfulnessRating: number | null;
};

type SuccessState = {
  returnStepLabel: string;
  readinessLabel: string | null;
};

const RETURN_STEP_OPTIONS: ReturnStepOption[] = [
  {
    type: "sit_down",
    label: "Sit down",
    description: "Get settled back into your spot.",
  },
  {
    type: "open_notebook",
    label: "Open my notebook",
    description: "Get ready for the next part of class.",
  },
  {
    type: "start_assignment",
    label: "Start the assignment",
    description: "Begin with the first thing in front of you.",
  },
  {
    type: "raise_hand_for_help",
    label: "Raise my hand for help",
    description: "Let your teacher know you need support.",
  },
  {
    type: "sip_of_water",
    label: "Take a sip of water",
    description: "Take one more calm pause before you jump in.",
  },
  {
    type: "other",
    label: "Something else",
    description: "Choose a different next step that fits you.",
  },
];

const READINESS_OPTIONS: ReadinessOption[] = [
  {
    id: "yes",
    label: "Yes",
    description: "I feel ready to get back to it.",
  },
  {
    id: "a_little",
    label: "A little",
    description: "I feel better, but I may still need a minute.",
  },
  {
    id: "not_yet",
    label: "Not yet",
    description: "I still need a bit more support.",
  },
];

type CheckinFinishStepProps = {
  studentId: string;
  action: (formData: FormData) => Promise<CloseStudentCheckinActionResult>;
  backHref: string;
  summaryChips: JourneySummaryChip[];
  recap: CheckinFinishRecap;
};

function getHelpfulnessLabel(value: number | null): string | null {
  switch (value) {
    case 1:
      return "Not really";
    case 2:
      return "A little";
    case 3:
      return "Some";
    case 4:
      return "Helpful";
    case 5:
      return "Very helpful";
    default:
      return null;
  }
}

function getSelectedReturnLabel(
  selectedType: ReturnStepType | null,
  otherText: string
): string | null {
  if (!selectedType) {
    return null;
  }

  if (selectedType === "other") {
    const trimmed = otherText.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  return RETURN_STEP_OPTIONS.find((option) => option.type === selectedType)?.label ?? null;
}

export function CheckinFinishStep({
  studentId,
  action,
  backHref,
  summaryChips,
  recap,
}: CheckinFinishStepProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const reduceMotion = classroomSafeMode || Boolean(prefersReducedMotion);
  const [isSaving, startSavingTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<ReturnStepType | null>(null);
  const [otherText, setOtherText] = useState("");
  const [readiness, setReadiness] = useState<ReadinessOptionId | null>(null);
  const [successState, setSuccessState] = useState<SuccessState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!selectedType) {
      return false;
    }

    if (selectedType === "other") {
      return otherText.trim().length > 0;
    }

    return true;
  }, [otherText, selectedType]);

  const selectedReturnLabel = useMemo(
    () => getSelectedReturnLabel(selectedType, otherText),
    [otherText, selectedType]
  );

  const helpfulnessLabel = useMemo(
    () => getHelpfulnessLabel(recap.helpfulnessRating),
    [recap.helpfulnessRating]
  );

  const readinessLabel = useMemo(
    () => READINESS_OPTIONS.find((option) => option.id === readiness)?.label ?? null,
    [readiness]
  );

  const recapItems = useMemo(() => {
    const items = [
      {
        label: "Zone",
        value: recap.zoneLabel ?? "Not saved yet",
      },
      {
        label: "Tool completed",
        value: recap.toolLabel ?? "No tool saved yet",
      },
    ];

    if (helpfulnessLabel && recap.helpfulnessRating) {
      items.push({
        label: "Tool felt",
        value: `${helpfulnessLabel} (${recap.helpfulnessRating}/5)`,
      });
    }

    return items;
  }, [helpfulnessLabel, recap.helpfulnessRating, recap.toolLabel, recap.zoneLabel]);

  useEffect(() => {
    if (!successState) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      router.push(`/students/${studentId}?saved=checkin`);
    }, reduceMotion ? 650 : 1100);

    return () => window.clearTimeout(timeoutId);
  }, [reduceMotion, router, studentId, successState]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSaving || successState) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const nextStepLabel = selectedReturnLabel;

    if (!nextStepLabel) {
      return;
    }

    setErrorMessage(null);

    startSavingTransition(async () => {
      try {
        const result = await action(formData);
        if (result.ok) {
          setSuccessState({
            returnStepLabel: nextStepLabel,
            readinessLabel,
          });
          return;
        }

        setErrorMessage(result.error);
      } catch {
        setErrorMessage("Unable to close this check-in. Please try again.");
      }
    });
  }

  return (
    <JourneyShell
      eyebrow="Check-in Journey"
      title={successState ? "Check-in complete" : "Return to learning"}
      description={
        successState
          ? "Heading back with one clear next step."
          : "Take one calm step back into class."
      }
      progressLabel="Step 3 of 3"
      progressPercent={100}
      summaryChips={summaryChips}
      footer={
        successState ? null : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              {selectedType
                ? "First step ready to save."
                : "Choose one next step to finish this check-in."}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => router.push(backHref)}
                className={buttonSecondaryClass}
              >
                Back to Tools
              </button>
              <button
                type="submit"
                form="checkin-finish-form"
                disabled={!canSubmit || isSaving}
                className={buttonPrimaryClass}
              >
                {isSaving ? "Saving..." : "Finish Check-In"}
              </button>
            </div>
          </div>
        )
      }
    >
      <AnimatePresence initial={false} mode="wait">
        {successState ? (
          <motion.div
            key="finish-success"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
            className="space-y-5"
            aria-live="polite"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-sm">
                <motion.div
                  className="h-6 w-6 rounded-full bg-primary"
                  animate={
                    reduceMotion
                      ? { opacity: 1 }
                      : {
                          scale: [0.92, 1.05, 1],
                          opacity: [0.8, 1, 1],
                        }
                  }
                  transition={{ duration: 0.55, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-xl font-semibold text-dark sm:text-2xl">
                Nice work. This check-in is saved.
              </p>
              <p className="mx-auto max-w-xl text-sm text-gray-700">
                You have a clear next step for going back to class.
              </p>
            </div>

            <div className="rounded-2xl border border-border-soft bg-surface/80 p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border-soft bg-white/85 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    Next step
                  </p>
                  <p className="mt-2 text-base font-semibold text-dark">
                    {successState.returnStepLabel}
                  </p>
                </div>

                {successState.readinessLabel ? (
                  <div className="rounded-xl border border-border-soft bg-white/85 p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                      Feeling now
                    </p>
                    <p className="mt-2 text-base font-semibold text-dark">
                      {successState.readinessLabel}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  <span>Heading back</span>
                  <span>Almost there</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: reduceMotion ? 0.45 : 0.85,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="finish-form"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, ease: "easeOut" }}
            className="space-y-5"
          >
            {errorMessage ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </p>
            ) : null}

            <section className="rounded-2xl border border-border-soft bg-surface/70 p-4 shadow-sm">
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Quick recap
                </p>
                <h2 className="text-lg font-semibold text-dark">Your reset so far</h2>
                <p className="text-sm text-gray-600">A quick look before you head back.</p>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {recapItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border-soft bg-white/85 p-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-base font-semibold text-dark">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <form id="checkin-finish-form" onSubmit={handleSubmit} className="space-y-5">
              <section className="space-y-3">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-dark">
                    What&apos;s your first step when you go back?
                  </p>
                  <p className="text-sm text-gray-600">
                    Choose one small move to help you ease back in.
                  </p>
                </div>

                <fieldset>
                  <legend className="sr-only">First step back</legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {RETURN_STEP_OPTIONS.map((option) => {
                      const isSelected = selectedType === option.type;

                      return (
                        <MotionCard
                          key={option.type}
                          animate={reduceMotion ? undefined : { y: isSelected ? -2 : 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="h-full rounded-2xl border border-border-soft p-0 shadow-sm"
                        >
                          <label
                            htmlFor={`return-step-${option.type}`}
                            className={cn(
                              "flex min-h-24 cursor-pointer items-start rounded-2xl border px-4 py-4 transition duration-[220ms] ease-out",
                              isSelected
                                ? "border-primary bg-primary/10 text-primary-dark shadow-[0_10px_24px_-18px_rgba(134,38,51,0.65)]"
                                : "border-transparent bg-white text-dark hover:border-primary/30 hover:bg-primary/5"
                            )}
                          >
                            <input
                              id={`return-step-${option.type}`}
                              type="radio"
                              name="return_step_type"
                              value={option.type}
                              checked={isSelected}
                              onChange={() => setSelectedType(option.type)}
                              className="sr-only"
                            />

                            <div className="space-y-1">
                              <p className="text-sm font-semibold">{option.label}</p>
                              <p
                                className={cn(
                                  "text-sm leading-relaxed",
                                  isSelected ? "text-primary-dark/85" : "text-gray-600"
                                )}
                              >
                                {option.description}
                              </p>
                            </div>
                          </label>
                        </MotionCard>
                      );
                    })}
                  </div>
                </fieldset>

                {selectedType === "other" ? (
                  <div>
                    <label
                      htmlFor="return_step_text"
                      className="block text-sm font-medium text-dark"
                    >
                      What is your first step?
                    </label>
                    <input
                      id="return_step_text"
                      name="return_step_text"
                      type="text"
                      value={otherText}
                      onChange={(event) => setOtherText(event.target.value)}
                      maxLength={80}
                      placeholder="Type your next step"
                      className={`${inputBaseClass} mt-2`}
                    />
                  </div>
                ) : (
                  <input type="hidden" name="return_step_text" value="" />
                )}
              </section>

              <section className="rounded-2xl border border-border-soft bg-white/80 p-4 shadow-sm">
                <div className="space-y-1">
                  <p className="text-base font-semibold text-dark">
                    Do you feel more ready now?
                  </p>
                  <p className="text-sm text-gray-600">Optional</p>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {READINESS_OPTIONS.map((option) => {
                    const isSelected = readiness === option.id;

                    return (
                      <MotionCard
                        key={option.id}
                        animate={reduceMotion ? undefined : { y: isSelected ? -2 : 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="h-full rounded-2xl border border-border-soft p-0 shadow-sm"
                      >
                        <button
                          type="button"
                          onClick={() => setReadiness(option.id)}
                          className={cn(
                            "flex min-h-24 w-full items-start rounded-2xl border px-4 py-4 text-left transition duration-[220ms] ease-out",
                            isSelected
                              ? "border-primary bg-primary/10 text-primary-dark shadow-[0_10px_24px_-18px_rgba(134,38,51,0.65)]"
                              : "border-transparent bg-white text-dark hover:border-primary/30 hover:bg-primary/5"
                          )}
                        >
                          <div className="space-y-1">
                            <p className="text-sm font-semibold">{option.label}</p>
                            <p
                              className={cn(
                                "text-sm leading-relaxed",
                                isSelected ? "text-primary-dark/85" : "text-gray-600"
                              )}
                            >
                              {option.description}
                            </p>
                          </div>
                        </button>
                      </MotionCard>
                    );
                  })}
                </div>
              </section>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </JourneyShell>
  );
}
