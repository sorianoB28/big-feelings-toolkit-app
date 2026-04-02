"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BookmarkCheck, Layers3, Loader2, Sparkles, Trash2 } from "lucide-react";
import { CheckInImageFrame } from "@/components/checkin-flow/check-in-image-frame";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { Badge } from "@/components/ui/badge";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

type SavedStrategyCard = {
  key: string;
  title: string;
  description: string;
  whyItHelps: string;
  imagePath: string;
  alt: string;
  imageStatus: "ready" | "pending";
};

type SavedStrategyItem = {
  id: string;
  profileId: string;
  strategyKey: string;
  categoryKey: string;
  categoryLabel: string;
  createdAt: string;
  card: SavedStrategyCard;
};

type SavedStrategiesPageProps = {
  isAuthenticated: boolean;
  profiles: Array<{
    id: string;
    name: string;
    avatar: string | null;
    checkinCount: number;
  }>;
  selectedProfileId: string | null;
  savedStrategies: SavedStrategyItem[];
};

type SortMode = "recent" | "category";

function StrategyArtwork({
  card,
  categoryLabel,
}: {
  card: SavedStrategyCard;
  categoryLabel: string;
}) {
  if (card.imageStatus === "ready") {
    return (
      <CheckInImageFrame
        src={card.imagePath}
        alt={card.alt}
        sizes="(min-width: 1280px) 18rem, (min-width: 768px) 30vw, 100vw"
      />
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border border-white/75 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.98),rgba(238,245,255,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(79,140,255,0.12),rgba(124,108,255,0.08),rgba(94,211,179,0.12))]" />
      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
        <span className="w-fit rounded-full border border-white/75 bg-white/84 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-dark shadow-sm">
          Illustration coming soon
        </span>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            {categoryLabel}
          </p>
          <p className="mt-3 max-w-[16rem] text-lg font-semibold tracking-[-0.03em] text-dark">
            {card.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function formatSavedDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Saved recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function SavedStrategiesPage({
  isAuthenticated,
  profiles,
  selectedProfileId,
  savedStrategies,
}: SavedStrategiesPageProps) {
  const prefersReducedMotion = useReducedMotion();
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [items, setItems] = useState(savedStrategies);
  const [pendingKeys, setPendingKeys] = useState<string[]>([]);
  const [error, setError] = useState("");

  const selectedProfile = profiles.find((profile) => profile.id === selectedProfileId) ?? null;

  const groupedStrategies = useMemo(() => {
    const bucket = new Map<string, { label: string; items: SavedStrategyItem[]; latest: number }>();

    for (const item of items) {
      const existing = bucket.get(item.categoryKey);
      const timestamp = Number.isNaN(new Date(item.createdAt).getTime())
        ? 0
        : new Date(item.createdAt).getTime();

      if (existing) {
        existing.items.push(item);
        existing.latest = Math.max(existing.latest, timestamp);
      } else {
        bucket.set(item.categoryKey, {
          label: item.categoryLabel,
          items: [item],
          latest: timestamp,
        });
      }
    }

    const entries = Array.from(bucket.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      latest: value.latest,
      items:
        sortMode === "recent"
          ? [...value.items].sort(
              (left, right) =>
                new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
            )
          : [...value.items].sort((left, right) => left.card.title.localeCompare(right.card.title)),
    }));

    return entries.sort((left, right) => {
      if (sortMode === "recent") {
        return right.latest - left.latest;
      }

      return left.label.localeCompare(right.label);
    });
  }, [items, sortMode]);

  async function handleRemove(strategy: SavedStrategyItem) {
    if (!selectedProfileId || pendingKeys.includes(strategy.strategyKey)) {
      return;
    }

    setError("");
    const previousItems = items;
    setPendingKeys((current) => [...current, strategy.strategyKey]);
    setItems((current) => current.filter((item) => item.strategyKey !== strategy.strategyKey));

    try {
      const response = await fetch("/api/strategies/save", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profile_id: selectedProfileId,
          strategy_key: strategy.strategyKey,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Unable to remove this saved strategy.");
      }
    } catch (nextError) {
      setItems(previousItems);
      setError(
        nextError instanceof Error
          ? nextError.message
          : "We couldn't remove that saved strategy right now."
      );
    } finally {
      setPendingKeys((current) => current.filter((key) => key !== strategy.strategyKey));
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <Badge className="bg-white/84 text-primary-dark shadow-sm">Saved Strategies</Badge>
          <h1 className="mt-6">Sign in to keep favorite strategies attached to a profile.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Saved strategies are profile-based, so this page becomes available once you sign in and
            choose or create a profile.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/auth" className={toolkitButtonPrimaryClass}>
              Sign in
            </Link>
            <Link href="/strategies" className={toolkitButtonSecondaryClass}>
              Explore strategies
            </Link>
          </div>
        </section>
      </div>
    );
  }

  if (!selectedProfile && profiles.length > 0) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <Badge className="bg-white/84 text-primary-dark shadow-sm">Saved Strategies</Badge>
          <h1 className="mt-6">Choose a profile to view saved strategies.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Saved strategies are organized per profile, so select one first to see the right set.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/strategies/saved?profileId=${encodeURIComponent(profile.id)}`}
                className={toolkitButtonSecondaryClass}
              >
                {profile.name}
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (profiles.length < 1) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
          <Badge className="bg-white/84 text-primary-dark shadow-sm">Saved Strategies</Badge>
          <h1 className="mt-6">Create a profile before saving strategies.</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
            Saved strategies are attached to a specific profile, so there needs to be at least one
            profile on your account before this library can be used.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard" className={toolkitButtonPrimaryClass}>
              Go to Dashboard
            </Link>
            <Link href="/strategies" className={toolkitButtonSecondaryClass}>
              Explore strategies
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
        <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-white/65 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-8 h-48 w-48 rounded-full bg-secondary/14 blur-3xl" />

        <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="max-w-3xl">
            <Badge className="bg-white/84 text-primary-dark shadow-sm">Saved Strategies</Badge>
            <h1 className="mt-6">Keep the best coping ideas close.</h1>
            <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
              Review the strategies saved for a specific profile, grouped into the same calm,
              browsable categories used across the Toolkit.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/strategies" className={toolkitButtonPrimaryClass}>
                Explore strategies
              </Link>
              {selectedProfileId ? (
                <Link
                  href={`/dashboard/profile/${encodeURIComponent(selectedProfileId)}`}
                  className={toolkitButtonSecondaryClass}
                >
                  Back to profile
                </Link>
              ) : null}
            </div>
          </div>

          <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center gap-2 text-primary-dark">
              <Sparkles className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Profile focus
              </p>
            </div>

            {selectedProfile ? (
              <div className="mt-5 rounded-[1.45rem] border border-white/76 bg-white/84 px-4 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <ProfileAvatar
                    avatarKey={selectedProfile.avatar}
                    name={selectedProfile.name}
                    size="md"
                  />
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                      Current profile
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.02em] text-dark">
                      {selectedProfile.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {items.length} saved strateg{items.length === 1 ? "y" : "ies"}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            <p className="mt-5 text-sm leading-6 text-slate-600">
              Saved ideas stay tied to the selected profile, so families or staff can keep favorite
              supports organized without mixing them together.
            </p>
          </aside>
        </div>
      </section>

      <section className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-primary-dark">
              <Layers3 className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Profile selection
              </p>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Switch profiles to see a different saved-strategy set, or change the card order to
              scan by recent saves or category.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/strategies/saved?profileId=${encodeURIComponent(profile.id)}`}
                aria-label={`Show saved strategies for ${profile.name}`}
                className={cn(
                  "toolkit-focus-ring rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:bg-white",
                  selectedProfileId === profile.id
                    ? "border-primary/18 bg-primary/10 text-primary-dark"
                    : "border-white/75 bg-white/84 text-primary-dark"
                )}
              >
                {profile.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["recent", "category"] as const).map((mode) => {
            const active = sortMode === mode;

            return (
              <button
                key={mode}
                type="button"
                onClick={() => setSortMode(mode)}
                aria-pressed={active}
                className={cn(
                  "toolkit-focus-ring rounded-full border px-4 py-2 text-sm font-semibold shadow-sm transition duration-[220ms] ease-out hover:-translate-y-0.5",
                  active
                    ? "border-primary/18 bg-primary/10 text-primary-dark"
                    : "border-white/75 bg-white/84 text-primary-dark hover:bg-white"
                )}
              >
                {mode === "recent" ? "Sort: Recent" : "Sort: Category"}
              </button>
            );
          })}
        </div>

        {error ? (
          <div className="mt-5 rounded-[1.2rem] border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm leading-6 text-amber-800">
            {error}
          </div>
        ) : null}
      </section>

      {items.length < 1 ? (
        <section className="toolkit-panel-strong px-6 py-10 text-center sm:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary-dark shadow-sm">
            <BookmarkCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-[1.8rem] tracking-[-0.04em] text-dark">
            No saved strategies yet
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Save a few ideas from the guided check-in or the strategies library, and they will show
            up here for {selectedProfile?.name ?? "this profile"}.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/strategies" className={toolkitButtonPrimaryClass}>
              Explore strategies
            </Link>
            {selectedProfileId ? (
              <Link
                href={`/check-in/profile?profileId=${encodeURIComponent(selectedProfileId)}`}
                className={toolkitButtonSecondaryClass}
              >
                Start a check-in
              </Link>
            ) : null}
          </div>
        </section>
      ) : (
        <div className="space-y-5">
          {groupedStrategies.map((group) => (
            <section
              key={group.key}
              className="toolkit-panel-strong scroll-mt-24 px-5 py-5 sm:px-6 sm:py-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                    Saved category
                  </p>
                  <h2 className="mt-3 text-[1.7rem] tracking-[-0.04em] text-dark">{group.label}</h2>
                </div>

                <div className="rounded-full border border-white/75 bg-white/84 px-4 py-2 text-sm font-semibold text-primary-dark shadow-sm">
                  {group.items.length} saved
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((strategy) => {
                  const pending = pendingKeys.includes(strategy.strategyKey);

                  return (
                    <motion.article
                      key={strategy.id}
                      whileHover={prefersReducedMotion || pending ? undefined : { y: -2 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
                      className={cn(
                        "overflow-hidden rounded-[1.75rem] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.95))] shadow-[0_24px_48px_-36px_rgba(79,140,255,0.24)] transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_56px_-38px_rgba(79,140,255,0.28)]",
                        pending && "opacity-80"
                      )}
                    >
                      <div className="p-3">
                        <StrategyArtwork card={strategy.card} categoryLabel={strategy.categoryLabel} />
                      </div>

                      <div className="px-5 pb-5 pt-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                              {strategy.categoryLabel}
                            </p>
                            <h3 className="mt-2 text-[1.12rem] font-semibold tracking-[-0.02em] text-dark">
                              {strategy.card.title}
                            </h3>
                          </div>

                          <span className="inline-flex items-center gap-2 rounded-full border border-primary/16 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-dark shadow-sm">
                            <BookmarkCheck className="h-3.5 w-3.5" />
                            Saved
                          </span>
                        </div>

                        <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/60">
                              How to
                            </p>
                            <p className="mt-2">{strategy.card.description}</p>
                          </div>

                          <div className="rounded-[1.15rem] border border-white/72 bg-white/84 px-4 py-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/60">
                              Why this helps
                            </p>
                            <p className="mt-2">{strategy.card.whyItHelps}</p>
                          </div>

                          <div className="rounded-[1.15rem] border border-white/72 bg-white/84 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/60">
                              Saved
                            </p>
                            <p className="mt-2 text-sm font-medium text-dark">
                              {formatSavedDate(strategy.createdAt)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemove(strategy)}
                          disabled={pending}
                          aria-label={`Remove ${strategy.card.title} from saved strategies`}
                          className={cn(
                            "toolkit-focus-ring mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition duration-[220ms] ease-out",
                            pending
                              ? "cursor-wait border-white/75 bg-white/84 text-slate-500"
                              : "border-white/75 bg-white/84 text-dark hover:-translate-y-0.5 hover:bg-white"
                          )}
                        >
                          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          {pending ? "Removing..." : "Remove"}
                        </button>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
