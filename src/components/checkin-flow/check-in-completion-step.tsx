"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookmarkCheck,
  CheckCircle2,
  Compass,
  LibraryBig,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  CHECKIN_FEELINGS,
  type CheckinStrategyKey,
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
import { useProfileSavedStrategies } from "./use-profile-saved-strategies";

const feelingLabelByKey = new Map(CHECKIN_FEELINGS.map((feeling) => [feeling.key, feeling.label]));
const strategyCardByKey = new Map(CHECKIN_STRATEGY_CARDS.map((card) => [card.key, card]));

type CompletionSaveState = "idle" | "saving" | "saved" | "error";

export function CheckInCompletionStep() {
  const router = useRouter();
  const { state, viewer, markCompleted, markPersistedCheckin, reset } = useGuidedCheckIn();
  const persistAttemptKeyRef = useRef<string | null>(null);
  const [saveState, setSaveState] = useState<CompletionSaveState>(
    state.persistedCheckinId ? "saved" : "idle"
  );

  const selectedZone = CHECKIN_ZONES.find((zone) => zone.key === state.zoneKey) ?? null;
  const selectedFeelingLabel =
    state.feelingDetailLabel ??
    (state.feelingKey ? feelingLabelByKey.get(state.feelingKey) ?? state.feelingKey : null);
  const selectedTool = state.selectedToolKey ? getToolByKey(state.selectedToolKey, "toolkit") : null;
  const selectedToolProgressLabel =
    typeof state.selectedToolProgressPercent === "number"
      ? `${Math.max(0, Math.min(100, Math.round(state.selectedToolProgressPercent)))}%`
      : null;
  const canPersistSelection =
    viewer.isAuthenticated && Boolean(state.profileId) && Boolean(selectedZone) && Boolean(selectedFeelingLabel);
  const { savedStrategyKeys } = useProfileSavedStrategies({
    enabled: canPersistSelection,
    profileId: state.profileId,
  });
  const completedWithoutSaving = !canPersistSelection;
  const selectedStrategyKeySet = useMemo(
    () => new Set(state.selectedStrategyKeys),
    [state.selectedStrategyKeys]
  );
  const savedStrategyCards = useMemo(() => {
    const cards = [];

    for (const strategyKey of state.selectedStrategyKeys) {
      const card = strategyCardByKey.get(strategyKey);

      if (card) {
        cards.push(card);
      }

      if (cards.length === 3) {
        break;
      }
    }

    return cards;
  }, [state.selectedStrategyKeys]);

  const nextTimeSavedCards = useMemo(() => {
    const cards = [];

    for (const strategyKey of savedStrategyKeys) {
      const card = strategyCardByKey.get(strategyKey);

      if (card) {
        cards.push(card);
      }

      if (cards.length === 4) {
        break;
      }
    }

    return cards;
  }, [savedStrategyKeys]);
  const temporarySavedCards = useMemo(() => savedStrategyCards.slice(0, 4), [savedStrategyCards]);
  const previouslySavedCards = useMemo(() => {
    const cards = [];

    for (const strategyKey of savedStrategyKeys) {
      if (selectedStrategyKeySet.has(strategyKey)) {
        continue;
      }

      const card = strategyCardByKey.get(strategyKey);

      if (card) {
        cards.push(card);
      }

      if (cards.length === 4) {
        break;
      }
    }

    return cards;
  }, [savedStrategyKeys, selectedStrategyKeySet]);

  const selectedStrategyKeysForSave = useMemo(
    () => [...state.selectedStrategyKeys] as CheckinStrategyKey[],
    [state.selectedStrategyKeys]
  );
  const completedAt = useMemo(() => state.completedAt ?? new Date().toISOString(), [state.completedAt]);
  const startedAt = state.startedAt ?? completedAt;
  const durationSeconds = useMemo(() => {
    const started = new Date(startedAt);
    const completed = new Date(completedAt);

    if (Number.isNaN(started.getTime()) || Number.isNaN(completed.getTime())) {
      return null;
    }

    return Math.max(0, Math.round((completed.getTime() - started.getTime()) / 1000));
  }, [completedAt, startedAt]);

  useEffect(() => {
    if (state.completedAt) {
      return;
    }

    markCompleted(completedAt);
  }, [completedAt, markCompleted, state.completedAt]);

  useEffect(() => {
    if (!canPersistSelection || !selectedZone || !selectedFeelingLabel) {
      return;
    }

    if (state.persistedCheckinId) {
      setSaveState("saved");

      return;
    }

    if (!state.sessionKey) {
      return;
    }

    const persistAttemptKey = `${state.sessionKey}:${state.profileId}:${completedAt}`;
    if (persistAttemptKeyRef.current === persistAttemptKey) {
      return;
    }

    persistAttemptKeyRef.current = persistAttemptKey;

    let isCancelled = false;
    const zoneKey = selectedZone.key;

    async function persistCompletion() {
      setSaveState("saving");

      try {
        const response = await fetch("/api/checkins", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionKey: state.sessionKey,
            profileId: state.profileId,
            zoneKey,
            feelingLabel: selectedFeelingLabel,
            intensity: state.intensity,
            bodyClueKeys: state.bodyClueKeys,
            notes: state.notes,
            durationSeconds,
            completed: true,
            startedAt,
            completedAt,
            selectedToolKey: state.selectedToolKey,
            selectedStrategyKeys: selectedStrategyKeysForSave,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to save check-in.");
        }

        const payload = (await response.json()) as { checkinId?: string };

        if (!isCancelled) {
          markPersistedCheckin(payload.checkinId ?? "saved");
          setSaveState("saved");
        }
      } catch {
        if (!isCancelled) {
          setSaveState("error");
        }
      }
    }

    void persistCompletion();

    return () => {
      isCancelled = true;
    };
  }, [
    canPersistSelection,
    markPersistedCheckin,
    selectedFeelingLabel,
    selectedStrategyKeysForSave,
    selectedZone,
    startedAt,
    completedAt,
    durationSeconds,
    state.bodyClueKeys,
    state.intensity,
    state.notes,
    state.persistedCheckinId,
    state.profileId,
    state.sessionKey,
    state.selectedToolKey,
  ]);

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
            The completion screen gives a calm recap and points to what may help next.
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
                {state.selectedToolWasSkipped
                  ? `You skipped this tool${
                      selectedToolProgressLabel ? ` at ${selectedToolProgressLabel}` : ""
                    } and moved on to the next support.`
                  : "You used a digital reset tool to help your body or mind shift."}
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

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center gap-2 text-primary-dark">
                <Save className="h-4 w-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Session save
                </p>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {state.profileName
                  ? `Profile selected: ${state.profileName}`
                  : "This check-in was completed without a saved profile."}
              </p>

              <div className="mt-4 rounded-[1.25rem] border border-white/74 bg-white/84 px-4 py-4 shadow-sm">
                {completedWithoutSaving ? (
                  <>
                    <p className="text-sm font-semibold text-dark">Completed locally</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      This check-in still finished normally. A parent, caregiver, or other adult can
                      create an account and add a profile if you want future sessions and saved
                      strategies stored long-term.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-dark">
                      {saveState === "saved"
                        ? "Saved to profile history"
                        : saveState === "saving"
                          ? "Saving session details"
                          : saveState === "error"
                            ? "Completed, but not synced"
                            : "Ready to save"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {saveState === "saved"
                        ? "Zone, feeling, body clues, tools, timing, notes, and the strategies from this check-in were saved."
                        : saveState === "saving"
                          ? "Writing the completed session in the background."
                          : saveState === "error"
                            ? "The check-in still completed, but saving failed quietly this time so your flow was not interrupted."
                            : "This check-in will be saved as soon as the completion screen loads."}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                Session model
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Completed check-ins can now store the fuller session context, including body clues,
                tool use, strategies, optional notes, and time spent in the flow.
              </p>
              {canPersistSelection && state.profileId ? (
                <div className="mt-5">
                  <Link
                    href={`/strategies/saved?profileId=${encodeURIComponent(state.profileId)}`}
                    className={toolkitButtonSecondaryClass}
                  >
                    View previously saved strategies
                  </Link>
                </div>
              ) : null}
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
            If something here helped, the best next move is usually one simple action you can
            actually do now.
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

      <section className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-primary-dark">
              <BookmarkCheck className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                {canPersistSelection
                  ? "Your saved strategies for next time"
                  : "Strategies you picked in this check-in"}
              </p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              {canPersistSelection
                ? "Keep a few trusted ideas close so the next check-in can start with supports you already know tend to help."
                : "These ideas stay visible for this summary only. A parent or other adult can create an account and add a profile to save them long-term."}
            </p>
          </div>

          {canPersistSelection && state.profileId ? (
            <Link
              href={`/strategies/saved?profileId=${encodeURIComponent(state.profileId)}`}
              className={toolkitButtonSecondaryClass}
            >
              View saved strategies
            </Link>
          ) : null}
        </div>

        {(canPersistSelection ? nextTimeSavedCards : temporarySavedCards).length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(canPersistSelection ? nextTimeSavedCards : temporarySavedCards).map((card) => (
              <div
                key={card.key}
                className="rounded-[1.3rem] border border-primary/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.95))] px-4 py-4 shadow-[0_20px_40px_-32px_rgba(79,140,255,0.24)]"
              >
                <span className="rounded-full border border-primary/14 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-dark">
                  {canPersistSelection ? "Saved to profile" : "Saved for this summary"}
                </span>
                <p className="mt-3 text-base font-semibold text-dark">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[1.25rem] border border-white/72 bg-white/84 px-4 py-4 shadow-sm">
            <p className="text-sm font-semibold text-dark">
              {canPersistSelection ? "No saved strategies yet" : "No temporary saved strategies yet"}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {canPersistSelection
                ? "Save a few strategies during the check-in flow or from the strategies library and they will show up here the next time."
                : "Choose a few strategies during the check-in flow and they will stay visible on this summary screen until you leave the session."}
            </p>
          </div>
        )}

        {canPersistSelection && previouslySavedCards.length > 0 ? (
          <div className="mt-5 rounded-[1.25rem] border border-white/72 bg-white/84 px-4 py-4 shadow-sm">
            <p className="text-sm font-semibold text-dark">Previously saved for this profile</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              These were already saved before this check-in and are still available the next time you come back.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {previouslySavedCards.map((card) => (
                <span
                  key={card.key}
                  className="rounded-full border border-primary/14 bg-primary/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark"
                >
                  {card.title}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
