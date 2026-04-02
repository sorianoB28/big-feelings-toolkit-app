"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHECKIN_BODY_CLUE_CATEGORIES,
  CHECKIN_FEELINGS,
  CHECKIN_ZONES,
} from "@/lib/checkin";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { CheckInImageFrame } from "./check-in-image-frame";
import { useGuidedCheckIn } from "./check-in-provider";

const feelingLabelByKey = new Map(CHECKIN_FEELINGS.map((feeling) => [feeling.key, feeling.label]));

export function BodyClueSelectionStep() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { state, toggleBodyClue } = useGuidedCheckIn();

  const selectedZone = CHECKIN_ZONES.find((zone) => zone.key === state.zoneKey) ?? null;
  const broadFeelingLabel = state.feelingKey ? feelingLabelByKey.get(state.feelingKey) ?? state.feelingKey : null;
  const selectedClues = CHECKIN_BODY_CLUE_CATEGORIES.flatMap((category) =>
    category.clues.filter((clue) => state.bodyClueKeys.includes(clue.key))
  );

  function handleContinue() {
    router.push("/check-in/reset-tool");
  }

  if (!selectedZone || !state.feelingKey) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Body Clues</Badge>
          <h2 className="mt-4">Choose a feeling first.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            This step works best after the feeling step, so the body clues can connect to what you
            already noticed emotionally.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/check-in/feeling" className={toolkitButtonPrimaryClass}>
              Go to Feeling Step
            </Link>
            <Link href="/check-in/zone" className={toolkitButtonSecondaryClass}>
              Back to Zone Step
            </Link>
          </div>
        </section>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Why body clues matter
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Noticing what your body is doing can make the next support suggestion feel more useful
            and more specific.
          </p>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Body Clues</Badge>
          <h2 className="mt-4">What is your body doing right now?</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Body clues can help you notice what kind of support may help next. Choose any that feel
            true right now.
          </p>
        </div>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Current check-in
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              {selectedZone.label}
            </span>
            <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
              {state.feelingDetailLabel ?? broadFeelingLabel}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Multiple body clues can fit at the same time. Pick as many as you need.
          </p>
        </aside>
      </section>

      <section className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Selected clues
          </p>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark shadow-sm">
            {selectedClues.length} chosen
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Pick as many as you need. Leaving this at zero is okay too if nothing fits clearly.
        </p>

        {selectedClues.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedClues.map((clue) => (
              <span
                key={clue.key}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark"
              >
                {clue.label}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <div className="space-y-5">
        {CHECKIN_BODY_CLUE_CATEGORIES.map((category) => (
          <section key={category.key} className="toolkit-panel-strong px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                  Body clue category
                </p>
                <h3 className="mt-3 text-[1.5rem] tracking-[-0.03em] text-dark">{category.label}</h3>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">{category.supportingLine}</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {category.clues.map((clue) => {
                const isSelected = state.bodyClueKeys.includes(clue.key);

                return (
                  <motion.button
                    key={clue.key}
                    type="button"
                    onClick={() => toggleBodyClue(clue.key)}
                    whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                    className={cn(
                      "toolkit-focus-ring group overflow-hidden rounded-[1.7rem] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.94))] text-left transition duration-[220ms] ease-out hover:border-primary/22 hover:shadow-[0_24px_48px_-34px_rgba(79,140,255,0.24)]",
                      isSelected &&
                        "border-primary/30 ring-2 ring-primary/12 shadow-[0_24px_50px_-34px_rgba(79,140,255,0.3)]"
                    )}
                    aria-pressed={isSelected}
                    >
                      <div className="p-3">
                      <CheckInImageFrame
                        src={clue.imagePath}
                        alt={clue.alt}
                        sizes="(min-width: 1280px) 18rem, (min-width: 640px) 42vw, 100vw"
                      />
                    </div>

                    <div className="px-5 pb-5 pt-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                            Body clue
                          </p>
                          <h4 className="mt-2 text-[1.05rem] font-semibold tracking-[-0.02em] text-dark">
                            {clue.label}
                          </h4>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="mt-1 h-5 w-5 text-primary-dark" />
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-white/65 pt-4">
                        <p className="text-sm font-medium text-slate-600">
                          {isSelected ? "Selected now" : "Tap to choose"}
                        </p>
                        <ArrowRight className="h-4 w-4 text-primary-dark transition-transform duration-[220ms] ease-out group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="toolkit-panel-strong px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
              Next step
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Continue to the reset-tool step, where these body clues can help guide what kind of
              support may feel most useful next.
            </p>
          </div>

          <button
            type="button"
            onClick={handleContinue}
            className={cn(toolkitButtonPrimaryClass, "gap-2 self-start lg:self-auto")}
          >
            {selectedClues.length > 0 ? "Continue to Reset Tool" : "Continue Without Body Clues"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
