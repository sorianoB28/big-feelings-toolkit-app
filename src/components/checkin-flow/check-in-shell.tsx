"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { ToolkitPrivacyBanner } from "@/components/ui/toolkit-privacy-banner";
import { toolkitButtonGhostClass, toolkitButtonSecondaryClass } from "@/components/ui/form-styles";
import {
  GUIDED_CHECKIN_STEPS,
  getGuidedCheckInStep,
  getGuidedCheckInStepIndex,
  getPreviousGuidedCheckInStep,
} from "@/lib/checkin";
import { cn } from "@/lib/utils";

type GuidedCheckInShellProps = {
  children: React.ReactNode;
};

function getStepKeyFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1) ?? "";

  if (lastSegment === "complete") {
    return "more-strategies";
  }

  return lastSegment;
}

export function GuidedCheckInShell({ children }: GuidedCheckInShellProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const currentStep = getGuidedCheckInStep(getStepKeyFromPathname(pathname)) ?? GUIDED_CHECKIN_STEPS[0];
  const currentStepIndex = getGuidedCheckInStepIndex(currentStep.key);
  const previousStep = getPreviousGuidedCheckInStep(currentStep.key);
  const backHref = previousStep?.href ?? "/toolkit";
  const backLabel = previousStep ? `Back to ${previousStep.label}` : "Back to Toolkit";
  const progressPercent =
    GUIDED_CHECKIN_STEPS.length > 1
      ? ((currentStepIndex + 1) / GUIDED_CHECKIN_STEPS.length) * 100
      : 100;

  return (
    <div className="app-container flex-1 pb-20 pt-3 sm:pt-8">
      <div className="toolkit-surface-level-1 relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
        <div className="pointer-events-none absolute left-0 top-0 h-36 w-36 rounded-full bg-white/60 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-8 h-44 w-44 rounded-full bg-secondary/12 blur-3xl" />

        <div className="relative space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Link href={backHref} className={cn(toolkitButtonGhostClass, "w-fit gap-2 px-4")}>
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </Link>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-dark/70">
                  Guided Check-In
                </p>
                <h1 className="mt-3 text-[2.2rem] sm:text-[2.8rem]">Notice what you need next.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Move through one calm step at a time. This public Toolkit check-in is built to
                  help you notice, reset, and choose a supportive next step without logging in.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 sm:items-end">
              <ToolkitPrivacyBanner
                visible
                message="This check-in does not save personal data."
                className="bg-white/82"
              />
              <Link href="/tools" className={toolkitButtonSecondaryClass}>
                Open Toolkit Library
              </Link>
            </div>
          </div>

          <div className="toolkit-panel-strong overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/65 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                  Step {currentStepIndex + 1} of {GUIDED_CHECKIN_STEPS.length}
                </p>
                <p className="mt-2 text-base font-semibold text-dark">{currentStep.label}</p>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">{currentStep.description}</p>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/70">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#4F8CFF,#7C6CFF)]"
                initial={prefersReducedMotion ? false : { width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              />
            </div>

            <ol className="mt-4 grid gap-3 md:grid-cols-5" aria-label="Guided check-in progress">
              {GUIDED_CHECKIN_STEPS.map((step, index) => {
                const isCurrent = step.key === currentStep.key;
                const isComplete = index < currentStepIndex;

                return (
                  <li key={step.key} className="list-none">
                    <div
                      className={cn(
                        "rounded-[1.5rem] border px-4 py-3 transition duration-[220ms] ease-out",
                        isCurrent
                          ? "border-primary/26 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,247,255,0.96))] shadow-[0_20px_48px_-32px_rgba(79,140,255,0.3)]"
                          : isComplete
                            ? "border-white/78 bg-white/90 shadow-[0_14px_34px_-28px_rgba(79,140,255,0.22)]"
                            : "border-white/62 bg-white/72"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            isCurrent
                              ? "bg-primary-dark text-white"
                              : isComplete
                                ? "bg-primary/14 text-primary-dark"
                                : "bg-white text-slate-500"
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-dark">{step.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-primary-dark/58">
                            {step.shortLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              className="min-h-[26rem]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
