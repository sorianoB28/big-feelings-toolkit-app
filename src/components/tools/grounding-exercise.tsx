"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type GroundingKey = "see" | "feel" | "hear" | "smell" | "taste";

type GroundingResult = {
  see: string[];
  feel: string[];
  hear: string[];
  smell: string[];
  taste: string[];
};

type GroundingExerciseProps = {
  className?: string;
  onFinish?: (result: GroundingResult) => void;
};

type GroundingStep = {
  key: GroundingKey;
  count: number;
  title: string;
  placeholder: string;
};

const STEPS: GroundingStep[] = [
  {
    key: "see",
    count: 5,
    title: "5 things you can see",
    placeholder: "Type something you can see...",
  },
  {
    key: "feel",
    count: 4,
    title: "4 things you can feel",
    placeholder: "Type something you can feel...",
  },
  {
    key: "hear",
    count: 3,
    title: "3 things you can hear",
    placeholder: "Type something you can hear...",
  },
  {
    key: "smell",
    count: 2,
    title: "2 things you can smell",
    placeholder: "Type something you can smell...",
  },
  {
    key: "taste",
    count: 1,
    title: "1 thing you can taste",
    placeholder: "Type something you can taste...",
  },
];

const TOTAL_REQUIRED = STEPS.reduce((sum, step) => sum + step.count, 0);
const MAX_ENTRY_LENGTH = 80;

const EMPTY_RESULT: GroundingResult = {
  see: [],
  feel: [],
  hear: [],
  smell: [],
  taste: [],
};

const EMPTY_INPUTS: Record<GroundingKey, string> = {
  see: "",
  feel: "",
  hear: "",
  smell: "",
  taste: "",
};

function getFirstIncompleteStepIndex(result: GroundingResult): number {
  const index = STEPS.findIndex((step) => result[step.key].length < step.count);
  return index === -1 ? STEPS.length - 1 : index;
}

export default function GroundingExercise({
  className,
  onFinish,
}: GroundingExerciseProps) {
  const prefersReducedMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [result, setResult] = useState<GroundingResult>(EMPTY_RESULT);
  const [inputs, setInputs] = useState<Record<GroundingKey, string>>(EMPTY_INPUTS);

  const cardRefs = useRef<Record<GroundingKey, HTMLDivElement | null>>({
    see: null,
    feel: null,
    hear: null,
    smell: null,
    taste: null,
  });
  const inputRefs = useRef<Record<GroundingKey, HTMLInputElement | null>>({
    see: null,
    feel: null,
    hear: null,
    smell: null,
    taste: null,
  });

  const totalCollected = useMemo(
    () => Object.values(result).reduce((sum, items) => sum + items.length, 0),
    [result]
  );
  const overallProgress = Math.round((totalCollected / TOTAL_REQUIRED) * 100);
  const allStepsComplete = STEPS.every((step) => result[step.key].length >= step.count);
  const finalResult = useMemo<GroundingResult>(
    () => ({
      see: [...result.see],
      feel: [...result.feel],
      hear: [...result.hear],
      smell: [...result.smell],
      taste: [...result.taste],
    }),
    [result]
  );

  useEffect(() => {
    if (!started || showSummary) {
      return;
    }

    const nextIndex = getFirstIncompleteStepIndex(result);
    if (nextIndex !== activeStepIndex) {
      setActiveStepIndex(nextIndex);
    }
  }, [activeStepIndex, result, showSummary, started]);

  useEffect(() => {
    if (!started || showSummary) {
      return;
    }

    const step = STEPS[activeStepIndex];
    const cardEl = cardRefs.current[step.key];
    const inputEl = inputRefs.current[step.key];
    if (!cardEl) {
      return;
    }

    cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeoutId = window.setTimeout(() => {
      inputEl?.focus();
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [activeStepIndex, showSummary, started]);

  function handleStart() {
    setStarted(true);
    setShowSummary(false);
    setActiveStepIndex(getFirstIncompleteStepIndex(result));
  }

  function handleReset() {
    setStarted(false);
    setShowSummary(false);
    setActiveStepIndex(0);
    setResult(EMPTY_RESULT);
    setInputs(EMPTY_INPUTS);
  }

  function handleFinish() {
    setShowSummary(true);
    setStarted(false);
    onFinish?.(finalResult);
  }

  function handleInputChange(stepKey: GroundingKey, value: string) {
    setInputs((current) => ({
      ...current,
      [stepKey]: value,
    }));
  }

  function handleAdd(step: GroundingStep) {
    if (!started || showSummary) {
      return;
    }

    const nextText = inputs[step.key].trim().slice(0, MAX_ENTRY_LENGTH);
    const existingItems = result[step.key];
    const isStepComplete = existingItems.length >= step.count;

    if (!nextText || isStepComplete) {
      return;
    }

    setResult((current) => ({
      ...current,
      [step.key]: [...current[step.key], nextText],
    }));
    setInputs((current) => ({
      ...current,
      [step.key]: "",
    }));
  }

  function handleRemove(stepKey: GroundingKey, indexToRemove: number) {
    setShowSummary(false);
    setStarted(true);
    setResult((current) => ({
      ...current,
      [stepKey]: current[stepKey].filter((_, index) => index !== indexToRemove),
    }));
  }

  function getStepMotion(stepComplete: boolean, isActive: boolean) {
    if (prefersReducedMotion) {
      return {
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0 },
      };
    }

    if (stepComplete) {
      return {
        animate: { opacity: 1, y: 0, scale: 1.01 },
        transition: { duration: 0.3, ease: "easeOut" as const },
      };
    }

    return {
      animate: { opacity: 1, y: 0, scale: isActive ? 1.005 : 1 },
      transition: { duration: 0.25, ease: "easeOut" as const },
    };
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/30 bg-white/70 p-6 shadow-md supports-[backdrop-filter]:backdrop-blur-md sm:p-8",
        className
      )}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-60 w-60 rounded-full bg-gray-500/7 blur-3xl" />

      <div className="relative z-10 space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight text-dark">5-4-3-2-1 Grounding</h2>
          <p className="text-sm text-gray-700">Notice what is around you, one step at a time.</p>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
            <span>Overall progress</span>
            <span>{totalCollected}/{TOTAL_REQUIRED}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={{ width: `${overallProgress}%` }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
            />
          </div>
        </header>

        {!showSummary ? (
          <>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleStart}
                disabled={started}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                Start
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-dark transition duration-200 hover:bg-gray-100"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={!allStepsComplete}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-dark transition duration-200 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Finish
              </button>
            </div>

            <div className="space-y-4">
              {STEPS.map((step, index) => {
                const items = result[step.key];
                const stepComplete = items.length >= step.count;
                const isActive = started && index === activeStepIndex && !stepComplete;
                const canAdd = started && !stepComplete && inputs[step.key].trim().length > 0;
                const motionProps = getStepMotion(stepComplete, isActive);

                return (
                  <motion.div
                    key={step.key}
                    ref={(element) => {
                      cardRefs.current[step.key] = element;
                    }}
                    initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    animate={motionProps.animate}
                    transition={motionProps.transition}
                    className={cn(
                      "rounded-xl border bg-white/85 p-4 shadow-sm transition-colors sm:p-5",
                      stepComplete
                        ? "border-emerald-200 bg-emerald-50/60"
                        : isActive
                          ? "border-primary/35"
                          : "border-border-soft"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-semibold text-dark">{step.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                          {items.length}/{step.count}
                        </span>
                        <AnimatePresence mode="wait">
                          {stepComplete ? (
                            <motion.span
                              key="complete"
                              initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                              transition={
                                prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }
                              }
                              className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                            >
                              Step complete
                            </motion.span>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        ref={(element) => {
                          inputRefs.current[step.key] = element;
                        }}
                        type="text"
                        value={inputs[step.key]}
                        onChange={(event) => handleInputChange(step.key, event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleAdd(step);
                          }
                        }}
                        maxLength={MAX_ENTRY_LENGTH}
                        disabled={!started || stepComplete}
                        placeholder={step.placeholder}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleAdd(step)}
                        disabled={!canAdd}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Add
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <AnimatePresence initial={false}>
                        {items.map((item, itemIndex) => (
                          <motion.span
                            key={`${step.key}-${item}-${itemIndex}`}
                            layout
                            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
                            transition={
                              prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => handleRemove(step.key, itemIndex)}
                              className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[10px] leading-none text-primary-dark transition hover:bg-primary/35"
                              aria-label={`Remove ${item}`}
                            >
                              x
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25, ease: "easeOut" }}
            className="rounded-xl border border-border-soft bg-white/90 p-5 shadow-sm sm:p-6"
          >
            <h3 className="text-lg font-semibold text-dark">Summary</h3>
            <p className="mt-1 text-sm text-gray-700">Great work. Here is what you noticed:</p>

            <div className="mt-4 space-y-3">
              {STEPS.map((step) => (
                <div key={`summary-${step.key}`} className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-sm font-semibold text-dark">{step.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {finalResult[step.key].length > 0 ? (
                      finalResult[step.key].map((item, index) => (
                        <span
                          key={`${step.key}-summary-${item}-${index}`}
                          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-500">No entries</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-primary-dark"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
