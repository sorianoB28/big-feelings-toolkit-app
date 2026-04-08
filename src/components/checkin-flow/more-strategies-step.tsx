"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bookmark, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHECKIN_FEELINGS,
  CHECKIN_STRATEGY_CARDS,
  CHECKIN_STRATEGY_CATEGORIES,
  CHECKIN_ZONES,
  getCheckinRecommendations,
  prioritizeSavedStrategies,
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
import { useProfileSavedStrategies } from "./use-profile-saved-strategies";

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
  showRelevantBadge?: boolean;
  isSelected: boolean;
  isPersisted?: boolean;
  isPending?: boolean;
  onToggleSaved: () => void;
};

function StrategyCardPanel({
  card,
  showRelevantBadge = false,
  isSelected,
  isPersisted = false,
  isPending = false,
  onToggleSaved,
}: StrategyCardPanelProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.95))] shadow-[0_24px_48px_-36px_rgba(79,140,255,0.24)]",
        showRelevantBadge && "border-primary/24 shadow-[0_28px_56px_-38px_rgba(79,140,255,0.32)]",
        (isSelected || isPersisted) && "ring-2 ring-primary/12"
      )}
    >
      <div className="relative shrink-0 p-3">
        <CheckInImageFrame
          src={card.imagePath}
          alt={card.alt}
          sizes="(min-width: 1280px) 18rem, (min-width: 768px) 30vw, 100vw"
        />
        <div className="pointer-events-none absolute left-6 top-6 z-10 flex flex-wrap gap-2">
          {showRelevantBadge ? (
            <div className="rounded-full bg-primary-dark px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-sm">
              Relevant now
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
              {strategyCategoryByKey.get(card.category)?.label ?? "Strategy"}
            </p>
            <h3 className="mt-2 text-[1.12rem] font-semibold tracking-[-0.02em] text-dark">
              {card.title}
            </h3>
          </div>

          {isSelected || isPersisted ? <CheckCircle2 className="mt-1 h-5 w-5 text-primary-dark" /> : null}
        </div>

        <div className="mt-4 flex-1 space-y-4 text-sm leading-6 text-slate-600">
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

        <motion.button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={isSelected}
          aria-label={isSelected ? `Remove ${card.title} from this check-in selection` : `Save ${card.title} for next time`}
          whileTap={prefersReducedMotion || isPending ? undefined : { scale: 0.985 }}
          disabled={isPending}
          className={cn(
            "toolkit-focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-[220ms] ease-out",
            isPending && "cursor-wait opacity-80",
            isSelected
              ? "border-primary/24 bg-primary/10 text-primary-dark shadow-[0_16px_34px_-26px_rgba(79,140,255,0.34)] hover:bg-primary/12"
              : "border-white/75 bg-white/84 text-dark hover:-translate-y-0.5 hover:bg-white"
          )}
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />}
          {isPending
            ? "Updating..."
            : isSelected
              ? "Selected"
              : isPersisted
                ? "Keep for this check-in"
                : "Save for next time"}
        </motion.button>
      </div>
    </motion.article>
  );
}

export function MoreStrategiesStep() {
  const { state, toggleStrategy, viewer } = useGuidedCheckIn();
  const canPersistSavedStrategies = viewer.isAuthenticated && Boolean(state.profileId);
  const needsProfileSelection = viewer.isAuthenticated && !state.profileId;
  const {
    savedStrategyKeys,
    savedStrategyKeySet,
    pendingStrategyKeySet,
    isLoading: isLoadingSavedStrategies,
    error: saveError,
    setSavedState,
  } = useProfileSavedStrategies({
    enabled: canPersistSavedStrategies,
    profileId: state.profileId,
  });
  const baselineSavedStrategyKeysRef = useRef<Set<string> | null>(null);

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
  const prioritizedRecommendationIds = useMemo(
    () => prioritizeSavedStrategies(recommendation.recommendedStrategyIds, savedStrategyKeys),
    [recommendation.recommendedStrategyIds, savedStrategyKeys]
  );

  const featuredStrategies = useMemo(() => {
    const cards: CheckinStrategyCard[] = [];

    for (const strategyKey of prioritizedRecommendationIds) {
      const card = strategyCardByKey.get(strategyKey);

      if (card) {
        cards.push(card);
      }

      if (cards.length === 4) {
        break;
      }
    }

    return cards;
  }, [prioritizedRecommendationIds]);

  const featuredStrategyKeySet = useMemo(
    () => new Set(featuredStrategies.map((card) => card.key)),
    [featuredStrategies]
  );

  const recommendedStrategyKeySet = useMemo(
    () => new Set(prioritizedRecommendationIds),
    [prioritizedRecommendationIds]
  );

  const recommendationSignalLabels = useMemo(() => {
    const zoneLabel = selectedZone?.label;

    if (!zoneLabel) {
      return [] as string[];
    }

    const labels: string[] = [zoneLabel];

    if (selectedFeelingLabel) {
      labels.push(selectedFeelingLabel);
    }

    if (state.bodyClueKeys.length > 0) {
      labels.push(
        `${state.bodyClueKeys.length} body clue${state.bodyClueKeys.length === 1 ? "" : "s"}`
      );
    }

    if (state.selectedToolKey) {
      labels.push("tool used");
    }

    return labels;
  }, [selectedFeelingLabel, selectedZone?.label, state.bodyClueKeys.length, state.selectedToolKey]);

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
    () => new Map(prioritizedRecommendationIds.map((strategyKey, index) => [strategyKey, index])),
    [prioritizedRecommendationIds]
  );

  const cardsByCategory = useMemo(
    (): Map<CheckinStrategyCategoryKey, CheckinStrategyCard[]> =>
      new Map<CheckinStrategyCategoryKey, CheckinStrategyCard[]>(
        orderedCategoryKeys.map((categoryKey) => [
          categoryKey,
          orderCardsForCategory(
            readyStrategyCards.filter(
              (card) => card.category === categoryKey && !featuredStrategyKeySet.has(card.key)
            ),
            recommendedOrder
          ),
        ])
      ),
    [featuredStrategyKeySet, orderedCategoryKeys, recommendedOrder]
  );

  const visibleCategoryKeys = useMemo(
    () =>
      orderedCategoryKeys.filter(
        (categoryKey: CheckinStrategyCategoryKey) =>
          (cardsByCategory.get(categoryKey) ?? []).length > 0
      ),
    [cardsByCategory, orderedCategoryKeys]
  );

  const savedIdeaCount = canPersistSavedStrategies
    ? savedStrategyKeys.length
    : state.selectedStrategyKeys.length;
  const sessionSelectedStrategyKeySet = useMemo(
    () => new Set(state.selectedStrategyKeys),
    [state.selectedStrategyKeys]
  );

  useEffect(() => {
    if (!canPersistSavedStrategies || baselineSavedStrategyKeysRef.current !== null || isLoadingSavedStrategies) {
      return;
    }

    baselineSavedStrategyKeysRef.current = new Set(savedStrategyKeys);
  }, [canPersistSavedStrategies, isLoadingSavedStrategies, savedStrategyKeys]);

  async function handleToggleSaved(card: CheckinStrategyCard) {
    const isSelectedInSession = sessionSelectedStrategyKeySet.has(card.key);

    if (!canPersistSavedStrategies || !state.profileId) {
      toggleStrategy(card.key);
      return;
    }

    if (pendingStrategyKeySet.has(card.key)) {
      return;
    }

    const nextSelectedInSession = !isSelectedInSession;
    const baselineSavedStrategyKeys = baselineSavedStrategyKeysRef.current ?? new Set(savedStrategyKeys);
    const wasPersistedBeforeThisCheckin = baselineSavedStrategyKeys.has(card.key);

    toggleStrategy(card.key);

    try {
      const result = await setSavedState(
        card.key,
        card.category,
        nextSelectedInSession || wasPersistedBeforeThisCheckin
      );

      if (!result.ok) {
        toggleStrategy(card.key);
      }
    } catch {
      toggleStrategy(card.key);
    }
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
          <Badge>More Strategies</Badge>
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
            {savedIdeaCount > 0 ? (
              <span className="rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
                {savedIdeaCount} saved
              </span>
            ) : null}
          </div>

          {recommendation.supportMessage ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">{recommendation.supportMessage}</p>
          ) : null}

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Choose the ideas you want to keep from this check-in so they stay easy to spot on the completion screen.
          </p>
          {canPersistSavedStrategies ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Saved ideas stay attached to {state.profileName ?? "this profile"} and show up again in saved strategies and check-in history.
            </p>
          ) : needsProfileSelection ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Choose a profile before saving if you want these ideas to stay attached to someone on your account.
            </p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-600">
              These picks stay only in this check-in summary unless a parent, caregiver, or other adult signs in and saves them to a profile.
            </p>
          )}
          {needsProfileSelection ? (
            <div className="mt-4">
              <Link href="/check-in/profile" className={toolkitButtonSecondaryClass}>
                Choose profile
              </Link>
            </div>
          ) : null}
          {saveError ? (
            <div className="mt-4 rounded-[1.15rem] border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-800">
              {saveError}
            </div>
          ) : null}
        </aside>
      </section>

      {featuredStrategies.length > 0 ? (
        <section className="toolkit-surface-level-1 relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(124,108,255,0.08),transparent)]" />
          <div className="pointer-events-none absolute right-0 top-6 h-36 w-36 rounded-full bg-primary/12 blur-3xl" />

          <div className="relative">
            <div className="grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-primary-dark">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Best fits right now
                  </p>
                </div>
                <h3 className="mt-3 text-[1.65rem] tracking-[-0.04em] text-dark">
                  These are the strongest matches from the larger strategy library.
                </h3>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  Start here first. These cards are prioritized from your zone, feeling, body
                  clues, and reset path so the first ideas feel clearly tied to this check-in.
                </p>
              </div>

              <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                  Chosen from the library
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  These top picks were selected from the wider strategies library so you can start
                  with the most relevant options before browsing further.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {recommendationSignalLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full border border-white/70 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-dark shadow-sm"
                    >
                      {label}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/76 bg-white/84 px-4 py-4 shadow-sm">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                      Saved ideas
                    </p>
                    <p className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-dark">
                      {savedIdeaCount}
                    </p>
                  </div>

                  <Link href="/strategies" className={toolkitButtonSecondaryClass}>
                    See all strategies
                  </Link>
                </div>
              </aside>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featuredStrategies.map((card) => (
                <StrategyCardPanel
                  key={card.key}
                  card={card}
                  showRelevantBadge={recommendedStrategyKeySet.has(card.key)}
                  isSelected={sessionSelectedStrategyKeySet.has(card.key)}
                  isPersisted={savedStrategyKeySet.has(card.key)}
                  isPending={
                    pendingStrategyKeySet.has(card.key) ||
                    (canPersistSavedStrategies && isLoadingSavedStrategies)
                  }
                  onToggleSaved={() => handleToggleSaved(card)}
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
              More from the library
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              If you want a few more options, keep browsing here. Categories stay ordered around
              your check-in, while the strongest matches stay highlighted above.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {visibleCategoryKeys.map((categoryKey) => {
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
        {visibleCategoryKeys.map((categoryKey) => {
          const category = strategyCategoryByKey.get(categoryKey);
          const cards = cardsByCategory.get(categoryKey) ?? [];

          if (!category || cards.length === 0) {
            return null;
          }

          const isRecommendedCategory =
            recommendation.recommendedStrategyCategoryKeys.includes(categoryKey) ||
            cards.some((card) => recommendedStrategyKeySet.has(card.key));

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
                  <h3 className="mt-3 text-[1.5rem] tracking-[-0.03em] text-dark">
                    {category.label}
                  </h3>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-slate-600">{category.supportingLine}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {cards.map((card) => (
                  <StrategyCardPanel
                    key={card.key}
                    card={card}
                    isSelected={sessionSelectedStrategyKeySet.has(card.key)}
                    isPersisted={savedStrategyKeySet.has(card.key)}
                    isPending={
                      pendingStrategyKeySet.has(card.key) ||
                      (canPersistSavedStrategies && isLoadingSavedStrategies)
                    }
                    onToggleSaved={() => handleToggleSaved(card)}
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
              Browse Toolkit Library
            </Link>
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
