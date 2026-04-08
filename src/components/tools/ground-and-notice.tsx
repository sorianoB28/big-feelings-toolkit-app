"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Eye, Hand, Sparkles, Volume2 } from "lucide-react";
import { MotionButton } from "@/components/ui/motion-primitives";
import { toolkitButtonPrimaryClass } from "@/components/ui/form-styles";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const STEPS = [
  {
    id: "see",
    label: "See",
    title: "Notice something you can see.",
    helper: "Pick the first steady thing that catches your eye.",
    Icon: Eye,
    options: ["Window light", "A calm color", "My desk", "Something still", "Something else"],
  },
  {
    id: "hear",
    label: "Hear",
    title: "Notice something you can hear.",
    helper: "Small sounds count. You do not have to search very hard.",
    Icon: Volume2,
    options: ["A fan", "A quiet voice", "Feet nearby", "Room sounds", "Something else"],
  },
  {
    id: "feel",
    label: "Feel",
    title: "Notice something you can feel.",
    helper: "Choose one simple body cue that feels real right now.",
    Icon: Hand,
    options: [
      "Feet on the floor",
      "Chair under me",
      "Hands together",
      "Air on my skin",
      "Something else",
    ],
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];
type StepSelections = Partial<Record<StepId, string>>;

export default function GroundAndNotice({
  isRunning,
  isFinished,
  elapsedSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selections, setSelections] = useState<StepSelections>({});
  const previousElapsedRef = useRef(elapsedSeconds);

  const completedCount = useMemo(
    () => STEPS.filter((step) => Boolean(selections[step.id])).length,
    [selections]
  );
  const activeStepIndex = STEPS.findIndex((step) => !selections[step.id]);
  const activeStep = activeStepIndex === -1 ? null : STEPS[activeStepIndex];
  const isComplete = completedCount === STEPS.length;
  const progressPercent = Math.round((completedCount / STEPS.length) * 100);

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (!wasReset) {
      return;
    }

    setSelections({});
  }, [elapsedSeconds]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: isFinished
        ? "Complete"
        : isComplete
          ? "Grounded and ready"
          : !isRunning && completedCount === 0
            ? "Press Start"
            : activeStep
              ? activeStep.label
              : "Grounding",
      cycleLabel: isComplete
        ? `${STEPS.length} of ${STEPS.length}`
        : `${completedCount + 1} of ${STEPS.length}`,
      cycleProgressPercent: progressPercent,
    });
  }, [
    activeStep,
    completedCount,
    isComplete,
    isFinished,
    isRunning,
    onStatusChange,
    progressPercent,
  ]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  function handleSelect(stepId: StepId, value: string) {
    if (!isRunning || isFinished) {
      return;
    }

    setSelections((current) => ({
      ...current,
      [stepId]: value,
    }));
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Ground &amp; notice
        </p>
        <p className="mt-1 text-lg font-semibold text-dark">
          {isComplete
            ? "Nice noticing. You are back in this moment."
            : "Tap one quick thing at a time. No long answers needed."}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {isComplete
            ? "Take one slow breath, then finish when you feel ready."
            : "See it, hear it, feel it, and let your attention settle."}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(234,242,255,0.84)_48%,rgba(247,250,252,0.76))] p-4 shadow-[0_24px_54px_-34px_rgba(79,140,255,0.24)] sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {isComplete ? (
              <motion.div
                key="complete"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="bg-white/82 flex min-h-[24rem] flex-col justify-center rounded-[1.7rem] border border-white/70 p-6 text-center shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)] sm:p-8"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(79,140,255,0.14),rgba(94,211,179,0.16))] text-primary-dark shadow-sm">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-dark">
                  You noticed what is around you.
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  That small shift matters. Your attention has something real to rest on now.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {STEPS.map((step) => (
                    <div
                      key={step.id}
                      className="rounded-[1.35rem] border border-white/70 bg-[linear-gradient(135deg,rgba(79,140,255,0.08),rgba(124,108,255,0.06),rgba(94,211,179,0.06))] px-4 py-4 text-left"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark/70">
                        {step.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-dark">{selections[step.id]}</p>
                    </div>
                  ))}
                </div>

                <MotionButton
                  type="button"
                  onClick={onFinish}
                  className={`${toolkitButtonPrimaryClass} mx-auto mt-6 min-h-12 min-w-44 gap-2`}
                >
                  <Check className="h-4 w-4" />
                  Finish Calm
                </MotionButton>
              </motion.div>
            ) : activeStep ? (
              <motion.div
                key={activeStep.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="bg-white/82 rounded-[1.7rem] border border-white/70 p-5 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] border border-white/80 bg-white/90 text-primary-dark shadow-sm">
                      <activeStep.Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-primary-dark/72 text-xs font-semibold uppercase tracking-[0.18em]">
                        Step {activeStepIndex + 1} of {STEPS.length}
                      </p>
                      <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-dark">
                        {activeStep.title}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        {activeStep.helper}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark">
                    Quick grounding
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {activeStep.options.map((option) => (
                    <motion.button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(activeStep.id, option)}
                      whileHover={prefersReducedMotion || !isRunning ? undefined : { y: -3 }}
                      whileTap={prefersReducedMotion || !isRunning ? undefined : { scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      disabled={!isRunning || isFinished}
                      className="toolkit-focus-ring bg-white/88 disabled:hover:bg-white/88 min-h-[5rem] rounded-[1.35rem] border border-white/80 px-4 py-4 text-left shadow-[0_18px_36px_-30px_rgba(15,23,42,0.14)] transition duration-[250ms] ease-out hover:border-primary/35 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="block text-sm font-semibold text-dark">{option}</span>
                      <span className="mt-2 block text-xs uppercase tracking-[0.16em] text-slate-500">
                        Tap to continue
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white/82 rounded-[1.7rem] border border-white/70 p-4 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
            <div className="space-y-3">
              {STEPS.map((step, index) => {
                const selectedValue = selections[step.id];
                const complete = Boolean(selectedValue);

                return (
                  <div
                    key={step.id}
                    className="rounded-[1.2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(79,140,255,0.05),rgba(255,255,255,0.9))] px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark/70">
                          Step {index + 1}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-dark">{step.label}</p>
                      </div>
                      {complete ? (
                        <span className="bg-primary/12 flex h-7 w-7 items-center justify-center rounded-full text-primary-dark">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Next
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedValue ?? "Waiting for one quick notice."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
