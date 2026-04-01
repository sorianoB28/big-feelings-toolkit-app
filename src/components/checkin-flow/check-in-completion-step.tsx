"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Compass, LibraryBig, RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHECKIN_FEELINGS,
  CHECKIN_STRATEGY_CARDS,
  CHECKIN_ZONES,
} from "@/lib/checkin";
import { getToolByKey } from "@/lib/tools/registry";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { useGuidedCheckIn } from "./check-in-provider";

const feelingLabelByKey = new Map(CHECKIN_FEELINGS.map((feeling) => [feeling.key, feeling.label]));
const strategyCardByKey = new Map(CHECKIN_STRATEGY_CARDS.map((card) => [card.key, card]));

export function CheckInCompletionStep() {
  const router = useRouter();
  const { state, reset } = useGuidedCheckIn();

  const selectedZone = CHECKIN_ZONES.find((zone) => zone.key === state.zoneKey) ?? null;
  const selectedFeelingLabel =
    state.feelingDetailLabel ??
    (state.feelingKey ? feelingLabelByKey.get(state.feelingKey) ?? state.feelingKey : null);
  const selectedTool = state.selectedToolKey ? getToolByKey(state.selectedToolKey, "toolkit") : null;
  const savedStrategyCards = [];

  for (const strategyKey of state.selectedStrategyKeys) {
    const card = strategyCardByKey.get(strategyKey);

    if (card) {
      savedStrategyCards.push(card);
    }

    if (savedStrategyCards.length === 3) {
      break;
    }
  }

  function handleStartOver() {
    reset();
    router.push("/check-in/zone");
  }

  if (!selectedZone || !state.feelingKey) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Check-In Complete</Badge>
          <h2 className="mt-4">Finish the guided check-in first.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            This completion page wraps up the full flow after the strategy step, so it works best
            once the earlier check-in choices are in place.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/check-in/more-strategies" className={toolkitButtonPrimaryClass}>
              Go to More Strategies
            </Link>
            <Link href="/check-in/zone" className={toolkitButtonSecondaryClass}>
              Start Check-In
            </Link>
          </div>
        </section>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Final step
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The completion screen gives a calm recap and points to what may help next without
            saving any personal data.
          </p>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="toolkit-surface-level-1 relative overflow-hidden px-6 py-7 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
        <div className="pointer-events-none absolute right-0 top-6 h-40 w-40 rounded-full bg-primary/12 blur-3xl" />

        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/88 text-primary-dark shadow-md">
            <CheckCircle2 className="h-7 w-7" />
          </div>

          <div className="mx-auto mt-6 max-w-3xl text-center">
            <Badge>Check-In Complete</Badge>
            <h2 className="mt-4 text-[2rem] tracking-[-0.04em] text-dark sm:text-[2.3rem]">
              You completed your guided check-in.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              You noticed what was going on, tried a support tool, and explored more ways to help.
              Keep the next step small and doable.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full bg-primary-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                {selectedZone.label}
              </span>
              {selectedFeelingLabel ? (
                <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
                  {selectedFeelingLabel}
                </span>
              ) : null}
              {selectedTool ? (
                <span className="rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
                  {selectedTool.title}
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-4">
            <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                Zone
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-dark">
                {selectedZone.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedZone.supportingLine}</p>
            </div>

            <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                Feeling
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-dark">
                {selectedFeelingLabel ?? "Feeling chosen"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You picked the feeling word that got closest to this moment.
              </p>
            </div>

            <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                Tool tried
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-dark">
                {selectedTool?.title ?? "A Toolkit tool"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You used a digital reset tool to help your body or mind shift.
              </p>
            </div>

            <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                Strategies explored
              </p>
              <p className="mt-3 text-lg font-semibold tracking-[-0.02em] text-dark">
                {state.selectedStrategyKeys.length > 0
                  ? `${state.selectedStrategyKeys.length} saved`
                  : "Strategy ideas reviewed"}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                You looked through more coping ideas that fit what you noticed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="toolkit-panel-strong px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex items-center gap-2 text-primary-dark">
            <Sparkles className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              What you explored
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-[1.3rem] border border-white/72 bg-white/84 px-4 py-4">
              <p className="text-sm font-semibold text-dark">Body clues noticed</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {state.bodyClueKeys.length > 0
                  ? `${state.bodyClueKeys.length} clue${state.bodyClueKeys.length === 1 ? "" : "s"} selected to help guide support.`
                  : "No body clues were saved, and that is okay too."}
              </p>
            </div>

            <div className="rounded-[1.3rem] border border-white/72 bg-white/84 px-4 py-4">
              <p className="text-sm font-semibold text-dark">Strategies worth keeping in mind</p>
              {savedStrategyCards.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {savedStrategyCards.map((card) => (
                    <span
                      key={card.key}
                      className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark"
                    >
                      {card.title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You can always go back to the strategy page if you want to keep a few favorites.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Next steps
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            This check-in does not save personal data. If something here helped, the best next move
            is usually one simple action you can actually do now.
          </p>

          <div className="mt-5 grid gap-3">
            <Link href="/tools" className={cn(toolkitButtonPrimaryClass, "justify-between gap-3")}>
              <span className="inline-flex items-center gap-2">
                <LibraryBig className="h-4 w-4" />
                Back to Toolkit Library
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/check-in/reset-tool"
              className={cn(toolkitButtonSecondaryClass, "justify-between gap-3")}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Another Tool
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/check-in/more-strategies"
              className={cn(toolkitButtonSecondaryClass, "justify-between gap-3")}
            >
              <span className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Explore More Strategies
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={handleStartOver}
              className={cn(toolkitButtonSecondaryClass, "justify-between gap-3")}
            >
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Start a New Check-In
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
