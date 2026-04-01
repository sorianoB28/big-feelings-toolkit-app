"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bookmark, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHECKIN_FEELINGS,
  CHECKIN_STRATEGY_CARDS,
  CHECKIN_STRATEGY_CATEGORIES,
  CHECKIN_ZONES,
  getCheckinRecommendations,
  type CheckinStrategyCard,
  type CheckinStrategyCategoryKey,
} from "@/lib/checkin";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { CheckInImageFrame } from "./check-in-image-frame";
import { useGuidedCheckIn } from "./check-in-provider";

const feelingLabelByKey = new Map(CHECKIN_FEELINGS.map((feeling) => [feeling.key, feeling.label]));
const strategyCategoryByKey = new Map(
  CHECKIN_STRATEGY_CATEGORIES.map((category) => [category.key, category])
);
const readyStrategyCards = CHECKIN_STRATEGY_CARDS.filter((card) => card.imageStatus === "ready");
const strategyCardByKey = new Map(readyStrategyCards.map((card) => [card.key, card]));

function uniqueKeys<TKey extends string>(values: readonly TKey[]): TKey[] {
  return Array.from(new Set(values));
}

function orderCardsForCategory(
  cards: CheckinStrategyCard[],
  recommendedOrder: Map<string, number>
): CheckinStrategyCard[] {
  return [...cards].sort((left, right) => {
    const leftRank = recommendedOrder.get(left.key) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = recommendedOrder.get(right.key) ?? Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return left.title.localeCompare(right.title);
  });
}

type StrategyCardPanelProps = {
  card: CheckinStrategyCard;
  isFeatured?: boolean;
  isSaved: boolean;
  onToggleSaved: () => void;
};

function StrategyCardPanel({
  card,
  isFeatured = false,
  isSaved,
  onToggleSaved,
}: StrategyCardPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
      className={cn(
        "overflow-hidden rounded-[1.75rem] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.95))] shadow-[0_24px_48px_-36px_rgba(79,140,255,0.24)]",
        isFeatured && "border-primary/24 shadow-[0_28px_56px_-38px_rgba(79,140,255,0.32)]",
        isSaved && "ring-2 ring-primary/12"
      )}
    >
      <div className="p-3">
        <CheckInImageFrame
          src={card.imagePath}
          alt={card.alt}
          sizes="(min-width: 1280px) 18rem, (min-width: 768px) 30vw, 100vw"
        />
        {isFeatured ? (
          <div className="absolute left-6 top-6 rounded-full bg-primary-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
            Relevant now
          </div>
        ) : null}
      </div>

      <div className="px-5 pb-5 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
              {strategyCategoryByKey.get(card.category)?.label ?? "Strategy"}
            </p>
            <h3 className="mt-2 text-[1.12rem] font-semibold tracking-[-0.02em] text-dark">
              {card.title}
            </h3>
          </div>

          {isSaved ? <CheckCircle2 className="mt-1 h-5 w-5 text-primary-dark" /> : null}
        </div>

        <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/60">
              How to
            </p>
            <p className="mt-2">{card.description}</p>
          </div>

          <div className="rounded-[1.15rem] border border-white/72 bg-white/84 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/60">
              Why this helps
            </p>
            <p className="mt-2">{card.whyItHelps}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleSaved}
          className={cn(
            "toolkit-focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-[220ms] ease-out",
            isSaved
              ? "border-primary/24 bg-primary/10 text-primary-dark hover:bg-primary/12"
              : "border-white/75 bg-white/84 text-dark hover:-translate-y-0.5 hover:bg-white"
          )}
        >
          <Bookmark className="h-4 w-4" />
          {isSaved ? "Saved for now" : "Keep this idea"}
        </button>
      </div>
    </motion.article>
  );
}

export function MoreStrategiesStep() {
  const router = useRouter();
  const { state, toggleStrategy, reset } = useGuidedCheckIn();

  const selectedZone = CHECKIN_ZONES.find((zone) => zone.key === state.zoneKey) ?? null;
  const selectedFeelingLabel =
    state.feelingDetailLabel ??
    (state.feelingKey ? feelingLabelByKey.get(state.feelingKey) ?? state.feelingKey : null);

  const recommendation = useMemo(
    () =>
      getCheckinRecommendations({
        zoneKey: state.zoneKey,
        feelingKey: state.feelingKey,
        feelingDetailKey: state.feelingDetailKey,
        bodyClueKeys: state.bodyClueKeys,
      }),
    [state.bodyClueKeys, state.feelingDetailKey, state.feelingKey, state.zoneKey]
  );

  const featuredStrategies = useMemo(
    () => {
      const cards: CheckinStrategyCard[] = [];

      for (const strategyKey of recommendation.recommendedStrategyIds) {
        const card = strategyCardByKey.get(strategyKey);

        if (card) {
          cards.push(card);
        }

        if (cards.length === 4) {
          break;
        }
      }

      return cards;
    },
    [recommendation.recommendedStrategyIds]
  );

  const featuredStrategyKeySet = useMemo(
    () => new Set(featuredStrategies.map((card) => card.key)),
    [featuredStrategies]
  );

  const orderedCategoryKeys = useMemo(() => {
    const recommendedCategoryKeys = [
      ...recommendation.recommendedStrategyCategoryKeys,
      ...featuredStrategies.map((card) => card.category),
    ] as CheckinStrategyCategoryKey[];

    return uniqueKeys([
      ...recommendedCategoryKeys,
      ...CHECKIN_STRATEGY_CATEGORIES.map((category) => category.key),
    ]);
  }, [featuredStrategies, recommendation.recommendedStrategyCategoryKeys]);

  const recommendedOrder = useMemo(
    () =>
      new Map(recommendation.recommendedStrategyIds.map((strategyKey, index) => [strategyKey, index])),
    [recommendation.recommendedStrategyIds]
  );

  const cardsByCategory = useMemo(
    () =>
      new Map(
        orderedCategoryKeys.map((categoryKey) => [
          categoryKey,
          orderCardsForCategory(
            readyStrategyCards.filter((card) => card.category === categoryKey),
            recommendedOrder
          ),
        ])
      ),
    [orderedCategoryKeys, recommendedOrder]
  );

  function handleStartOver() {
    reset();
    router.push("/check-in/zone");
  }

  if (!selectedZone || !state.feelingKey) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>More Strategies</Badge>
          <h2 className="mt-4">Finish the earlier check-in steps first.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            This page uses your zone, feeling, and body clues to bring the most relevant strategy
            cards to the top.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/check-in/reset-tool" className={toolkitButtonPrimaryClass}>
              Go to Reset Tool
            </Link>
            <Link href="/check-in/zone" className={toolkitButtonSecondaryClass}>
              Start Check-In
            </Link>
          </div>
        </section>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Why this step exists
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            More Strategies is meant to extend the reset tool with a few real-world supports that
            still fit what you noticed in your check-in.
          </p>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Step 5</Badge>
          <h2 className="mt-4">More ways to help right now.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Start with one or two options that feel doable. These strategies are here to give you
            practical support after the digital tool, not to make you do everything at once.
          </p>
        </div>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Check-in summary
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-primary-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              {selectedZone.label}
            </span>
            {selectedFeelingLabel ? (
              <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
                {selectedFeelingLabel}
              </span>
            ) : null}
            {state.selectedToolKey ? (
              <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
                Tool used
              </span>
            ) : null}
            {state.selectedStrategyKeys.length > 0 ? (
              <span className="rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
                {state.selectedStrategyKeys.length} saved
              </span>
            ) : null}
          </div>

          {recommendation.supportMessage ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">{recommendation.supportMessage}</p>
          ) : null}

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Save the ideas that feel useful now so they stay easy to spot while you browse.
          </p>
        </aside>
      </section>

      {featuredStrategies.length > 0 ? (
        <section className="toolkit-surface-level-1 relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(124,108,255,0.08),transparent)]" />
          <div className="pointer-events-none absolute right-0 top-6 h-36 w-36 rounded-full bg-primary/12 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-primary-dark">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Best fits right now
                  </p>
                </div>
                <h3 className="mt-3 text-[1.65rem] tracking-[-0.04em] text-dark">
                  Start with the strategies most connected to your check-in.
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  These cards are prioritized from your zone, feeling, and body clues so the first
                  ideas feel easier to try right away.
                </p>
              </div>

              <div className="rounded-[1.35rem] border border-white/76 bg-white/82 px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                  Saved ideas
                </p>
                <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-dark">
                  {state.selectedStrategyKeys.length}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredStrategies.map((card) => (
                <StrategyCardPanel
                  key={card.key}
                  card={card}
                  isFeatured
                  isSaved={state.selectedStrategyKeys.includes(card.key)}
                  onToggleSaved={() => toggleStrategy(card.key)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
              Browse by category
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              You can still browse the full strategy set. The most relevant categories appear first.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {orderedCategoryKeys.map((categoryKey) => {
              const category = strategyCategoryByKey.get(categoryKey);
              const isRecommended = recommendation.recommendedStrategyCategoryKeys.includes(categoryKey);

              if (!category) {
                return null;
              }

              return (
                <Link
                  key={categoryKey}
                  href={`#${categoryKey}`}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] shadow-sm transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:bg-white",
                    isRecommended
                      ? "border-primary/16 bg-primary/10 text-primary-dark"
                      : "border-white/75 bg-white/84 text-primary-dark"
                  )}
                >
                  {category.label}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {orderedCategoryKeys.map((categoryKey) => {
          const category = strategyCategoryByKey.get(categoryKey);
          const cards = cardsByCategory.get(categoryKey) ?? [];

          if (!category || cards.length === 0) {
            return null;
          }

          const isRecommendedCategory =
            recommendation.recommendedStrategyCategoryKeys.includes(categoryKey) ||
            cards.some((card) => featuredStrategyKeySet.has(card.key));

          return (
            <section
              key={category.key}
              id={category.key}
              className="toolkit-panel-strong scroll-mt-24 px-5 py-5 sm:px-6 sm:py-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                      Strategy category
                    </p>
                    {isRecommendedCategory ? (
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-dark">
                        Prioritized
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-[1.5rem] tracking-[-0.03em] text-dark">{category.label}</h3>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">{category.supportingLine}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                  <StrategyCardPanel
                    key={card.key}
                    card={card}
                    isSaved={state.selectedStrategyKeys.includes(card.key)}
                    onToggleSaved={() => toggleStrategy(card.key)}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="toolkit-panel-strong px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
              Finish
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              When you are ready, wrap up the guided check-in with a short completion screen and a
              clear set of next-step options.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/tools" className={toolkitButtonSecondaryClass}>
              Open Toolkit Library
            </Link>
            <button
              type="button"
              onClick={handleStartOver}
              className={cn(toolkitButtonSecondaryClass, "gap-2")}
            >
              Start Another Check-In
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link href="/check-in/complete" className={cn(toolkitButtonPrimaryClass, "gap-2")}>
              Finish Check-In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
