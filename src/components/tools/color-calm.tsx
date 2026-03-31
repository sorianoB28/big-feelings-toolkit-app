"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, RefreshCw, Sparkles } from "lucide-react";
import { MotionButton } from "@/components/ui/motion-primitives";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const SEGMENTS = [
  {
    id: "north",
    label: "Top shape",
    position: { top: "13%", left: "50%" },
    size: "h-20 w-28 sm:h-24 sm:w-32",
    rotation: -2,
    gradient: "linear-gradient(135deg, rgba(124,108,255,0.95), rgba(79,140,255,0.88))",
    glow: "0 18px 40px -26px rgba(124,108,255,0.65)",
  },
  {
    id: "northEast",
    label: "Upper right shape",
    position: { top: "27%", left: "78%" },
    size: "h-24 w-20 sm:h-28 sm:w-24",
    rotation: 42,
    gradient: "linear-gradient(145deg, rgba(79,140,255,0.95), rgba(94,211,179,0.82))",
    glow: "0 18px 40px -26px rgba(79,140,255,0.6)",
  },
  {
    id: "east",
    label: "Right shape",
    position: { top: "50%", left: "86%" },
    size: "h-20 w-28 sm:h-24 sm:w-32",
    rotation: 88,
    gradient: "linear-gradient(145deg, rgba(94,211,179,0.9), rgba(79,140,255,0.72))",
    glow: "0 18px 40px -26px rgba(94,211,179,0.55)",
  },
  {
    id: "southEast",
    label: "Lower right shape",
    position: { top: "73%", left: "78%" },
    size: "h-24 w-20 sm:h-28 sm:w-24",
    rotation: 136,
    gradient: "linear-gradient(145deg, rgba(94,211,179,0.92), rgba(124,108,255,0.72))",
    glow: "0 18px 40px -26px rgba(94,211,179,0.55)",
  },
  {
    id: "south",
    label: "Bottom shape",
    position: { top: "87%", left: "50%" },
    size: "h-20 w-28 sm:h-24 sm:w-32",
    rotation: 180,
    gradient: "linear-gradient(135deg, rgba(79,140,255,0.92), rgba(124,108,255,0.82))",
    glow: "0 18px 40px -26px rgba(79,140,255,0.56)",
  },
  {
    id: "southWest",
    label: "Lower left shape",
    position: { top: "73%", left: "22%" },
    size: "h-24 w-20 sm:h-28 sm:w-24",
    rotation: 224,
    gradient: "linear-gradient(145deg, rgba(124,108,255,0.88), rgba(94,211,179,0.82))",
    glow: "0 18px 40px -26px rgba(124,108,255,0.55)",
  },
  {
    id: "west",
    label: "Left shape",
    position: { top: "50%", left: "14%" },
    size: "h-20 w-28 sm:h-24 sm:w-32",
    rotation: 268,
    gradient: "linear-gradient(145deg, rgba(79,140,255,0.88), rgba(124,108,255,0.74))",
    glow: "0 18px 40px -26px rgba(79,140,255,0.52)",
  },
  {
    id: "northWest",
    label: "Upper left shape",
    position: { top: "27%", left: "22%" },
    size: "h-24 w-20 sm:h-28 sm:w-24",
    rotation: 316,
    gradient: "linear-gradient(145deg, rgba(94,211,179,0.85), rgba(79,140,255,0.8))",
    glow: "0 18px 40px -26px rgba(94,211,179,0.52)",
  },
] as const;

const TOTAL_SEGMENTS = SEGMENTS.length;

export default function ColorCalm({
  isRunning,
  isFinished,
  elapsedSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [filledSegmentIds, setFilledSegmentIds] = useState<string[]>([]);
  const previousElapsedRef = useRef(elapsedSeconds);

  const filledCount = filledSegmentIds.length;
  const isCanvasComplete = filledCount === TOTAL_SEGMENTS;
  const fillProgressPercent = Math.round((filledCount / TOTAL_SEGMENTS) * 100);

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (!wasReset) {
      return;
    }

    setFilledSegmentIds([]);
  }, [elapsedSeconds]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: isFinished
        ? "Complete"
        : isCanvasComplete
          ? "Canvas complete"
          : !isRunning && filledCount === 0
            ? "Press Start"
            : isRunning
              ? `${filledCount} of ${TOTAL_SEGMENTS} filled`
              : "Paused",
      cycleProgressPercent: fillProgressPercent,
    });
  }, [fillProgressPercent, filledCount, isCanvasComplete, isFinished, isRunning, onStatusChange]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  const helperCopy = useMemo(() => {
    if (isCanvasComplete) {
      return "Everything is filled. Take a breath and finish when you're ready.";
    }
    if (!isRunning && filledCount === 0) {
      return "Press Start, then tap the shapes to slowly fill the canvas.";
    }
    if (!isRunning) {
      return "Paused. You can pick up where you left off any time.";
    }
    return "Tap one shape at a time and watch the palette settle into place.";
  }, [filledCount, isCanvasComplete, isRunning]);

  function fillSegment(segmentId: string) {
    if (!isRunning || isFinished || filledSegmentIds.includes(segmentId)) {
      return;
    }

    setFilledSegmentIds((current) => [...current, segmentId]);
  }

  function handleResetCanvas() {
    setFilledSegmentIds([]);
  }

  function handleFinishNow() {
    onFinish();
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Color calm</p>
        <p className="mt-1 text-lg font-semibold text-dark">
          {isCanvasComplete ? "A calm canvas, one tap at a time." : "Tap the shapes and let the color settle in."}
        </p>
        <p className="mt-1 text-sm text-slate-600">{helperCopy}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),rgba(234,242,255,0.8)_48%,rgba(247,250,252,0.72))] px-4 py-5 shadow-[0_24px_54px_-34px_rgba(79,140,255,0.26)] sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-24 rounded-full bg-white/70 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 top-12 h-32 w-32 rounded-full bg-secondary/12 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 bottom-10 h-36 w-36 rounded-full bg-accent/14 blur-3xl" />

          <div className="relative mx-auto aspect-square w-full max-w-[28rem]">
            <motion.div
              className="absolute inset-[12%] rounded-full border border-primary/16 bg-white/36"
              animate={
                prefersReducedMotion || isFinished
                  ? undefined
                  : { scale: [0.98, 1.01, 0.98], opacity: [0.85, 1, 0.85] }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : { duration: 8, ease: "easeInOut", repeat: Infinity }
              }
            />

            {SEGMENTS.map((segment, index) => {
              const isFilled = filledSegmentIds.includes(segment.id);

              return (
                <div
                  key={segment.id}
                  className="absolute"
                  style={{
                    top: segment.position.top,
                    left: segment.position.left,
                    transform: `translate(-50%, -50%) rotate(${segment.rotation}deg)`,
                  }}
                >
                  <motion.button
                    type="button"
                    onClick={() => fillSegment(segment.id)}
                    whileHover={
                      prefersReducedMotion || isFilled || !isRunning ? undefined : { y: -3, scale: 1.02 }
                    }
                    whileTap={prefersReducedMotion || isFilled || !isRunning ? undefined : { scale: 0.97 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={`${segment.size} relative block rounded-[2rem] border border-white/80 shadow-[0_20px_34px_-28px_rgba(15,23,42,0.28)]`}
                    aria-label={segment.label}
                    aria-pressed={isFilled}
                    disabled={!isRunning || isFinished}
                  >
                    <span className="absolute inset-[1px] rounded-[calc(2rem-1px)] bg-white/80 backdrop-blur" />
                    <motion.span
                      className="absolute inset-[1px] rounded-[calc(2rem-1px)]"
                      style={{
                        backgroundImage: segment.gradient,
                        boxShadow: isFilled ? segment.glow : "none",
                      }}
                      animate={{
                        opacity: isFilled ? 1 : 0,
                        scale: isFilled ? 1 : 0.92,
                      }}
                      transition={{ duration: 0.34, ease: "easeOut", delay: isFilled ? index * 0.02 : 0 }}
                    />
                    <motion.span
                      className="absolute inset-0 rounded-[2rem] border border-white/70"
                      animate={{
                        opacity: isFilled ? 1 : 0.48,
                      }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    />
                    <AnimatePresence>
                      {isFilled ? (
                        <motion.span
                          key="filled"
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          className="absolute inset-0 flex items-center justify-center text-white"
                        >
                          <Check className="h-5 w-5 drop-shadow-[0_4px_8px_rgba(15,23,42,0.26)]" />
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </motion.button>
                </div>
              );
            })}

            <div className="absolute left-1/2 top-1/2 flex h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/85 bg-white/86 shadow-[0_22px_40px_-28px_rgba(79,140,255,0.38)] backdrop-blur">
              <div
                className="absolute inset-[8%] rounded-full"
                style={{
                  backgroundImage: `conic-gradient(from 180deg, #7C6CFF 0%, #4F8CFF ${fillProgressPercent / 2}%, #5ED3B3 ${fillProgressPercent}%, rgba(226,232,240,0.9) ${fillProgressPercent}%, rgba(226,232,240,0.9) 100%)`,
                }}
              />
              <div className="absolute inset-[16%] rounded-full bg-white/94" />
              <div className="relative text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/70">
                  Filled
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-dark">
                  {filledCount}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500">
                  of {TOTAL_SEGMENTS}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[1.7rem] border border-white/70 bg-white/82 p-4 shadow-[0_20px_44px_-32px_rgba(15,23,42,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-dark">Canvas progress</p>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">
                {fillProgressPercent}%
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#7C6CFF_0%,#4F8CFF_56%,#5ED3B3_100%)]"
                animate={{ width: `${fillProgressPercent}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.24, ease: "easeOut" }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={isCanvasComplete ? "complete" : filledCount}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-4 rounded-[1.35rem] border border-white/70 bg-[linear-gradient(135deg,rgba(79,140,255,0.09),rgba(124,108,255,0.08),rgba(94,211,179,0.08))] px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-primary-dark shadow-sm">
                    <Sparkles className="h-[18px] w-[18px]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-dark">
                      {isCanvasComplete ? "Nice work. Your calm canvas is complete." : "Keep going one shape at a time."}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {isCanvasComplete
                        ? "You can finish now, or simply pause for a second and look at the color you made."
                        : "Each tap adds a little more color and gives your mind one simple thing to focus on."}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="rounded-[1.7rem] border border-white/70 bg-white/82 p-3 shadow-[0_20px_44px_-32px_rgba(15,23,42,0.18)]">
            <div className="grid gap-3">
              <MotionButton
                type="button"
                onClick={handleResetCanvas}
                disabled={filledCount === 0}
                className={`${toolkitButtonSecondaryClass} min-h-12 w-full gap-2`}
              >
                <RefreshCw className="h-4 w-4" />
                Reset Colors
              </MotionButton>
              <MotionButton
                type="button"
                onClick={handleFinishNow}
                disabled={!isRunning && filledCount === 0}
                className={`${toolkitButtonPrimaryClass} min-h-12 w-full gap-2`}
              >
                <Check className="h-4 w-4" />
                {isCanvasComplete ? "Finish Calm" : "Finish Tool"}
              </MotionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
