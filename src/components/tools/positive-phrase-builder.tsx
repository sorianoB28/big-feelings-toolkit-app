"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, MessageSquareHeart, RefreshCw, Sparkles } from "lucide-react";
import { MotionButton } from "@/components/ui/motion-primitives";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const OPENERS = [
  {
    id: "i_can",
    label: "I can...",
    preview: "I can",
    helper: "Start with a steady reminder about what is still possible.",
  },
  {
    id: "im_okay",
    label: "I'm okay even if...",
    preview: "I'm okay even if",
    helper: "Make room for something hard without letting it define the whole moment.",
  },
  {
    id: "right_now",
    label: "Right now I just need to...",
    preview: "Right now I just need to",
    helper: "Focus on the next small thing that would help.",
  },
] as const;

const MIDDLE_OPTIONS: Record<
  (typeof OPENERS)[number]["id"],
  Array<{
    id: string;
    label: string;
    text: string;
  }>
> = {
  i_can: [
    { id: "one_step", label: "take this one step at a time", text: "take this one step at a time" },
    { id: "slow_down", label: "slow my body down", text: "slow my body down" },
    { id: "ask_for_help", label: "ask for help if I need it", text: "ask for help if I need it" },
    { id: "try_again", label: "try again without rushing", text: "try again without rushing" },
  ],
  im_okay: [
    { id: "hard", label: "this feels hard", text: "this feels hard" },
    { id: "minute", label: "I need a minute", text: "I need a minute" },
    { id: "figuring_it_out", label: "I am still figuring it out", text: "I am still figuring it out" },
    { id: "not_perfect", label: "today is not perfect", text: "today is not perfect" },
  ],
  right_now: [
    { id: "one_breath", label: "take one breath", text: "take one breath" },
    { id: "next_small_thing", label: "do the next small thing", text: "do the next small thing" },
    { id: "support", label: "get a little support", text: "get a little support" },
    { id: "moment", label: "give myself a moment", text: "give myself a moment" },
  ],
};

const ENDINGS = [
  { id: "enough", label: "and that is enough for now.", text: "and that is enough for now." },
  { id: "next", label: "before I decide what comes next.", text: "before I decide what comes next." },
  { id: "steadier", label: "to help myself feel steadier.", text: "to help myself feel steadier." },
  { id: "time", label: "one step at a time.", text: "one step at a time." },
] as const;

type OpenerId = (typeof OPENERS)[number]["id"];

function buildPhrase(
  openerId: OpenerId | null,
  middleText: string | null,
  endingText: string | null,
): string {
  if (!openerId || !middleText) {
    return "Choose words that feel steady and believable for this moment.";
  }

  const opener = OPENERS.find((item) => item.id === openerId);
  const basePhrase = opener ? `${opener.preview} ${middleText}` : middleText;

  if (!endingText) {
    return `${basePhrase}.`;
  }

  const punctuationSafeBase = basePhrase.endsWith(".") ? basePhrase.slice(0, -1) : basePhrase;
  return `${punctuationSafeBase}, ${endingText}`;
}

export default function PositivePhraseBuilder({
  isRunning,
  isFinished,
  elapsedSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hasStartedBuilder, setHasStartedBuilder] = useState(false);
  const [selectedOpenerId, setSelectedOpenerId] = useState<OpenerId | null>(null);
  const [selectedMiddleId, setSelectedMiddleId] = useState<string | null>(null);
  const [selectedEndingId, setSelectedEndingId] = useState<string | null>(null);
  const previousElapsedRef = useRef(elapsedSeconds);

  const selectedOpener = OPENERS.find((option) => option.id === selectedOpenerId) ?? null;
  const middleOptions = selectedOpenerId ? MIDDLE_OPTIONS[selectedOpenerId] : [];
  const selectedMiddle = middleOptions.find((option) => option.id === selectedMiddleId) ?? null;
  const selectedEnding = ENDINGS.find((option) => option.id === selectedEndingId) ?? null;
  const completedCount =
    (selectedOpenerId ? 1 : 0) + (selectedMiddleId ? 1 : 0) + (selectedEndingId ? 1 : 0);
  const isPhraseReady = Boolean(selectedOpener && selectedMiddle && selectedEnding);
  const progressPercent = Math.round((completedCount / 3) * 100);

  const currentStep = useMemo(() => {
    if (!hasStartedBuilder) {
      return 0;
    }
    if (!selectedOpenerId) {
      return 1;
    }
    if (!selectedMiddleId) {
      return 2;
    }
    if (!selectedEndingId) {
      return 3;
    }
    return 4;
  }, [hasStartedBuilder, selectedEndingId, selectedMiddleId, selectedOpenerId]);

  const builtPhrase = buildPhrase(
    selectedOpenerId,
    selectedMiddle?.text ?? null,
    selectedEnding?.text ?? null,
  );

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (!wasReset) {
      return;
    }

    setHasStartedBuilder(false);
    setSelectedOpenerId(null);
    setSelectedMiddleId(null);
    setSelectedEndingId(null);
  }, [elapsedSeconds]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: isFinished
        ? "Complete"
        : !hasStartedBuilder
          ? "Ready to begin"
          : isPhraseReady
            ? "Phrase ready"
            : currentStep === 1
              ? "Choose a starting phrase"
              : currentStep === 2
                ? "Choose the message"
                : "Choose the ending",
      cycleLabel: isPhraseReady ? "3 of 3" : `${Math.max(1, completedCount + 1)} of 3`,
      cycleProgressPercent: progressPercent,
    });
  }, [completedCount, currentStep, hasStartedBuilder, isFinished, isPhraseReady, onStatusChange, progressPercent]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  function handleRestart() {
    setHasStartedBuilder(true);
    setSelectedOpenerId(null);
    setSelectedMiddleId(null);
    setSelectedEndingId(null);
  }

  function handleSelectOpener(openerId: OpenerId) {
    if (!isRunning || isFinished) {
      return;
    }

    setSelectedOpenerId(openerId);
    setSelectedMiddleId(null);
    setSelectedEndingId(null);
  }

  function handleSelectMiddle(middleId: string) {
    if (!isRunning || isFinished) {
      return;
    }

    setSelectedMiddleId(middleId);
    setSelectedEndingId(null);
  }

  function handleSelectEnding(endingId: string) {
    if (!isRunning || isFinished) {
      return;
    }

    setSelectedEndingId(endingId);
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Positive phrase builder
        </p>
        <p className="mt-1 text-lg font-semibold text-dark">
          Build one short phrase that feels steady, kind, and believable.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Choose simple words you could actually use in a hard moment. Nothing extra, nothing cheesy.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(234,242,255,0.84)_48%,rgba(247,250,252,0.76))] p-4 shadow-[0_24px_54px_-34px_rgba(79,140,255,0.24)] sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {!hasStartedBuilder ? (
              <motion.div
                key="intro"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="flex min-h-[24rem] flex-col justify-center rounded-[1.7rem] border border-white/70 bg-white/82 p-6 text-center shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)] sm:p-8"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(79,140,255,0.14),rgba(124,108,255,0.12),rgba(94,211,179,0.14))] text-primary-dark shadow-sm">
                  <MessageSquareHeart className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-dark">
                  Start with words that help, not pressure.
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:mx-auto sm:text-base">
                  When you are ready, build one short phrase you can borrow right now. The best phrase is the one that feels calm and true.
                </p>

                <MotionButton
                  type="button"
                  onClick={() => setHasStartedBuilder(true)}
                  disabled={!isRunning || isFinished}
                  className={`${toolkitButtonPrimaryClass} mx-auto mt-6 min-h-12 min-w-44 gap-2`}
                >
                  <Sparkles className="h-4 w-4" />
                  Start Builder
                </MotionButton>
              </motion.div>
            ) : isPhraseReady ? (
              <motion.div
                key="complete"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="flex min-h-[24rem] flex-col justify-center rounded-[1.7rem] border border-white/70 bg-white/82 p-6 text-center shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)] sm:p-8"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(135deg,rgba(79,140,255,0.14),rgba(94,211,179,0.16))] text-primary-dark shadow-sm">
                  <Check className="h-6 w-6" />
                </div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark/72">
                  Your phrase
                </p>
                <blockquote className="mx-auto mt-4 max-w-3xl text-balance text-2xl font-semibold leading-relaxed tracking-[-0.04em] text-dark sm:text-[2rem] sm:leading-[1.45]">
                  &ldquo;{builtPhrase}&rdquo;
                </blockquote>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  Keep the part that feels useful. You do not have to force the words that do not fit.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                  <MotionButton
                    type="button"
                    onClick={handleRestart}
                    className={`${toolkitButtonSecondaryClass} min-h-12 min-w-40 gap-2`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restart Phrase
                  </MotionButton>
                  <MotionButton
                    type="button"
                    onClick={onFinish}
                    className={`${toolkitButtonPrimaryClass} min-h-12 min-w-40 gap-2`}
                  >
                    <Check className="h-4 w-4" />
                    Finish Phrase
                  </MotionButton>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${currentStep}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="rounded-[1.7rem] border border-white/70 bg-white/82 p-5 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)] sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] border border-white/80 bg-white/90 text-primary-dark shadow-sm">
                      <MessageSquareHeart className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark/72">
                        Step {currentStep} of 3
                      </p>
                      <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-dark">
                        {currentStep === 1
                          ? "Choose how the phrase begins."
                          : currentStep === 2
                            ? "Choose the part you need to hear."
                            : "Choose how to close the thought."}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                        {currentStep === 1
                          ? "Pick the opening that feels most believable for this moment."
                          : currentStep === 2
                            ? "Choose words that match what would help right now."
                            : "Finish with a calmer ending you could actually say to yourself."}
                      </p>
                    </div>
                  </div>

                  <MotionButton
                    type="button"
                    onClick={handleRestart}
                    disabled={!selectedOpenerId && !selectedMiddleId && !selectedEndingId}
                    className={`${toolkitButtonSecondaryClass} min-h-11 gap-2 px-4`}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restart
                  </MotionButton>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(currentStep === 1
                    ? OPENERS.map((option) => ({
                        key: option.id,
                        title: option.label,
                        helper: option.helper,
                        onSelect: () => handleSelectOpener(option.id),
                        selected: selectedOpenerId === option.id,
                      }))
                    : currentStep === 2
                      ? middleOptions.map((option) => ({
                          key: option.id,
                          title: option.label,
                          helper: "Tap to use these words in the middle of your phrase.",
                          onSelect: () => handleSelectMiddle(option.id),
                          selected: selectedMiddleId === option.id,
                        }))
                      : ENDINGS.map((option) => ({
                          key: option.id,
                          title: option.label,
                          helper: "Tap to finish the phrase in a calm, supportive way.",
                          onSelect: () => handleSelectEnding(option.id),
                          selected: selectedEndingId === option.id,
                        }))).map((option) => (
                    <motion.button
                      key={option.key}
                      type="button"
                      onClick={option.onSelect}
                      whileHover={prefersReducedMotion || !isRunning ? undefined : { y: -3 }}
                      whileTap={prefersReducedMotion || !isRunning ? undefined : { scale: 0.98 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      disabled={!isRunning || isFinished}
                      className={`toolkit-focus-ring min-h-[6rem] rounded-[1.35rem] border px-4 py-4 text-left shadow-[0_18px_36px_-30px_rgba(15,23,42,0.14)] transition duration-[250ms] ease-out ${
                        option.selected
                          ? "border-primary/40 bg-primary/8"
                          : "border-white/80 bg-white/88 hover:border-primary/35 hover:bg-primary/5"
                      } disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-white/88`}
                    >
                      <span className="block text-sm font-semibold text-dark">{option.title}</span>
                      <span className="mt-2 block text-sm leading-6 text-slate-600">
                        {option.helper}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[1.7rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_42px_-30px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-dark">Phrase progress</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">
                {progressPercent}%
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7C6CFF_0%,#4F8CFF_58%,#5ED3B3_100%)]"
                animate={{ width: `${progressPercent}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              />
            </div>

            <div className="mt-4 rounded-[1.35rem] border border-white/70 bg-[linear-gradient(135deg,rgba(79,140,255,0.08),rgba(124,108,255,0.06),rgba(94,211,179,0.06))] px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark/72">
                Live preview
              </p>
              <p className="mt-3 text-base font-semibold leading-7 text-dark">{builtPhrase}</p>
            </div>

            <div className="mt-4 space-y-3">
              {[
                {
                  label: "Start",
                  value: selectedOpener?.label ?? "Choose how it begins",
                  complete: Boolean(selectedOpener),
                },
                {
                  label: "Middle",
                  value: selectedMiddle?.label ?? "Choose the message",
                  complete: Boolean(selectedMiddle),
                },
                {
                  label: "Close",
                  value: selectedEnding?.label ?? "Choose the ending",
                  complete: Boolean(selectedEnding),
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className="rounded-[1.2rem] border border-white/70 bg-[linear-gradient(135deg,rgba(79,140,255,0.05),rgba(255,255,255,0.9))] px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark/70">
                        Step {index + 1}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-dark">{item.label}</p>
                    </div>
                    {item.complete ? (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/12 text-primary-dark">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Next
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
