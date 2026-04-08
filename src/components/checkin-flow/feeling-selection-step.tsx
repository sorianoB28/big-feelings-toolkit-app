"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, CornerDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHECKIN_FEELINGS,
  CHECKIN_FEELING_GROUPS,
  CHECKIN_ZONES,
  type CheckinFeeling,
  type CheckinFeelingGroup,
  type CheckinFeelingKey,
} from "@/lib/checkin";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { CheckInImageFrame } from "./check-in-image-frame";
import { useGuidedCheckIn } from "./check-in-provider";

const feelingGroupByKey = new Map(CHECKIN_FEELING_GROUPS.map((group) => [group.key, group]));

function getBroadFeelingOptions(zoneKey: string | null): CheckinFeeling[] {
  if (!zoneKey) {
    return [];
  }

  return CHECKIN_FEELINGS.filter((feeling) => feeling.zoneKey === zoneKey);
}

function getHelperCopy(detailGroup: CheckinFeelingGroup | null): string | null {
  if (detailGroup) {
    return "Choose the broad feeling first, then pick a more specific word that fits best.";
  }

  return null;
}

export function FeelingSelectionStep() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const { state, setFeeling, setFeelingDetail } = useGuidedCheckIn();

  const selectedZone = CHECKIN_ZONES.find((zone) => zone.key === state.zoneKey) ?? null;
  const broadFeelingOptions = getBroadFeelingOptions(state.zoneKey);
  const activeBroadFeeling =
    broadFeelingOptions.find((feeling) => feeling.key === state.feelingKey) ?? null;
  const activeFeelingGroup = activeBroadFeeling?.groupKey
    ? feelingGroupByKey.get(activeBroadFeeling.groupKey) ?? null
    : null;

  function handleChooseBroadFeeling(feelingKey: CheckinFeelingKey) {
    setFeeling(feelingKey);
  }

  function handleChooseSpecificFeeling(detailKey: string, detailLabel: string) {
    if (!activeBroadFeeling) {
      return;
    }

    setFeeling(activeBroadFeeling.key);
    setFeelingDetail(detailKey, detailLabel);
    router.push("/check-in/body-clues");
  }

  if (!selectedZone) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Feeling Step</Badge>
          <h2 className="mt-4">Choose a zone first.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            This step needs the zone you picked in Step 1 so it can narrow the feeling options to
            the closest match.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/check-in/zone" className={toolkitButtonPrimaryClass}>
              Go to Zone Step
            </Link>
            <Link href="/toolkit" className={toolkitButtonSecondaryClass}>
              Back to Toolkit
            </Link>
          </div>
        </section>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Why this matters
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The selected zone helps filter the feeling choices so this step stays calmer, faster,
            and easier to scan.
          </p>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Feeling</Badge>
          <h2 className="mt-4">Which feeling gets closest?</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Start with the bigger feeling word from your {selectedZone.label.toLowerCase()}, then
            see whether a more specific word fits even better.
          </p>
        </div>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Helpful note
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>This word can help describe what your feeling might also mean.</p>
            <p>You only need the closest fit, not the perfect word.</p>
          </div>
        </aside>
      </section>

      <section className="toolkit-panel-strong px-5 py-5 sm:px-6 sm:py-6">
        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <div
            className={cn(
              "rounded-[1.4rem] border px-4 py-4 transition duration-[220ms] ease-out",
              "border-primary/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(243,247,255,0.95))] shadow-[0_18px_42px_-32px_rgba(79,140,255,0.28)]"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
              Stage 1
            </p>
            <p className="mt-2 text-sm font-semibold text-dark">Pick the broad feeling first</p>
          </div>
          <div
            className={cn(
              "rounded-[1.4rem] border px-4 py-4 transition duration-[220ms] ease-out",
              activeBroadFeeling
                ? "border-primary/22 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(243,247,255,0.95))] shadow-[0_18px_42px_-32px_rgba(79,140,255,0.28)]"
                : "border-white/70 bg-white/78"
            )}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
              Stage 2
            </p>
            <p className="mt-2 text-sm font-semibold text-dark">
              {activeBroadFeeling ? "Now choose the more specific word" : "Stage 2 opens after your first choice"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
            {selectedZone.label}
          </span>
          <p className="text-sm leading-6 text-slate-600">
            Pick the broad feeling that feels closest before choosing a more specific word.
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {broadFeelingOptions.map((feeling) => {
            const detailGroup = feeling.groupKey ? feelingGroupByKey.get(feeling.groupKey) ?? null : null;
            const isActive = activeBroadFeeling?.key === feeling.key;
            const helperCopy = getHelperCopy(detailGroup);
            const previewLabels = detailGroup?.feelings.slice(0, 3).map((item) => item.label) ?? [];

            return (
              <motion.button
                key={feeling.key}
                type="button"
                onClick={() => handleChooseBroadFeeling(feeling.key)}
                whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                className={cn(
                  "toolkit-focus-ring flex min-h-[16rem] flex-col rounded-[1.8rem] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,248,255,0.92))] p-5 text-left transition duration-[220ms] ease-out hover:border-primary/22 hover:shadow-[0_22px_46px_-34px_rgba(79,140,255,0.24)]",
                  isActive &&
                    "border-primary/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(241,246,255,0.97))] ring-2 ring-primary/12 shadow-[0_24px_50px_-34px_rgba(79,140,255,0.3)]"
                )}
                aria-pressed={isActive}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                      Broad feeling
                    </p>
                    <h3 className="mt-3 text-[1.3rem] tracking-[-0.03em] text-dark">{feeling.label}</h3>
                  </div>

                  {isActive ? (
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-dark text-white shadow-[0_18px_36px_-24px_rgba(33,77,147,0.42)]">
                      <CheckCircle2 className="h-4.5 w-4.5" />
                    </span>
                  ) : null}
                </div>

                {helperCopy ? (
                  <p className="mt-4 text-sm leading-6 text-slate-600">{helperCopy}</p>
                ) : null}

                {previewLabels.length > 0 ? (
                  <div className={`${helperCopy ? "mt-4" : "mt-5"} flex flex-wrap gap-2`}>
                    {previewLabels.map((label) => (
                      <span
                        key={`${feeling.key}-${label}`}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark shadow-sm"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                ) : null}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="toolkit-panel-strong px-5 py-5 sm:px-6 sm:py-6">
        {activeBroadFeeling ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary-dark/70">
                  <CornerDownRight className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Stage 2
                  </p>
                </div>
                <h3 className="mt-3 text-[1.55rem] tracking-[-0.03em] text-dark">
                  {activeFeelingGroup
                    ? `${activeBroadFeeling.label} can also mean...`
                    : `${activeBroadFeeling.label} may already be the clearest word.`}
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {activeFeelingGroup
                    ? "Choose the word that feels closest. These visuals are there to support the meaning, while the label gives the actual word."
                    : "If this broad feeling already feels specific enough, confirm it and move on to body clues."}
                </p>
              </div>

              <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark shadow-sm">
                {selectedZone.label}
              </span>
            </div>

            {activeFeelingGroup ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activeFeelingGroup.feelings.map((detailFeeling) => {
                  const isSelected =
                    state.feelingKey === activeBroadFeeling.key &&
                    state.feelingDetailKey === detailFeeling.key;

                  return (
                    <motion.button
                      key={detailFeeling.key}
                      type="button"
                      onClick={() => handleChooseSpecificFeeling(detailFeeling.key, detailFeeling.label)}
                      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                      className={cn(
                        "toolkit-focus-ring group overflow-hidden rounded-[1.8rem] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.95))] text-left transition duration-[220ms] ease-out hover:border-primary/24 hover:shadow-[0_24px_48px_-34px_rgba(79,140,255,0.24)]",
                        isSelected &&
                          "border-primary/30 ring-2 ring-primary/12 shadow-[0_24px_50px_-34px_rgba(79,140,255,0.3)]"
                      )}
                      aria-pressed={isSelected}
                    >
                      <div className="p-3">
                        <CheckInImageFrame
                          src={detailFeeling.imagePath}
                          alt={detailFeeling.alt}
                          sizes="(min-width: 1280px) 20rem, (min-width: 640px) 42vw, 100vw"
                        />
                      </div>

                      <div className="px-5 pb-5 pt-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                              Specific feeling
                            </p>
                            <h4 className="mt-2 text-[1.15rem] font-semibold tracking-[-0.02em] text-dark">
                              {detailFeeling.label}
                            </h4>
                          </div>

                          {isSelected ? (
                            <CheckCircle2 className="mt-1 h-5 w-5 text-primary-dark" />
                          ) : null}
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-white/65 pt-4">
                          <p className="text-sm font-medium text-slate-600">
                            {isSelected ? "Selected. Continue to body clues." : "Use this word"}
                          </p>
                          <ArrowRight className="h-4 w-4 text-primary-dark transition-transform duration-[220ms] ease-out group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                    Specific feeling
                  </p>
                  <h4 className="mt-3 text-[1.35rem] font-semibold tracking-[-0.03em] text-dark">
                    {activeBroadFeeling.label}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    This feeling does not need an extra word list here. If it still feels like the
                    closest match, confirm it and continue.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleChooseSpecificFeeling(activeBroadFeeling.key, activeBroadFeeling.label)
                  }
                  className="toolkit-focus-ring rounded-[1.8rem] border border-primary/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,246,255,0.95))] px-5 py-5 text-left shadow-[0_24px_50px_-36px_rgba(79,140,255,0.24)] transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:border-primary/28"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                    Confirm and continue
                  </p>
                  <h4 className="mt-3 text-[1.3rem] font-semibold tracking-[-0.03em] text-dark">
                    {activeBroadFeeling.label} fits best
                  </h4>
                  <div className="mt-6 flex items-center justify-between border-t border-white/70 pt-4">
                    <p className="text-sm font-medium text-slate-600">Go to Body Clues</p>
                    <ArrowRight className="h-4 w-4 text-primary-dark" />
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
              Stage 2
            </p>
            <h3 className="mt-3 text-[1.45rem] tracking-[-0.03em] text-dark">
              Pick the broad feeling first.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Once you choose the broad feeling above, this section will show either the detailed
              Canva feeling cards or a simple confirmation if that word is already specific enough.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
