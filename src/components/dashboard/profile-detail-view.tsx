import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock3, History, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { toolkitButtonPrimaryClass, toolkitButtonSecondaryClass } from "@/components/ui/form-styles";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { CHECKIN_STRATEGY_CARDS } from "@/lib/checkin";
import type { AccountProfileDetail } from "@/db/queries/profiles";
import { cn } from "@/lib/utils";

type ProfileDetailViewProps = {
  profile: AccountProfileDetail;
};

const zoneChipClassName: Record<AccountProfileDetail["history"][number]["zone"], string> = {
  red: "bg-rose-100 text-rose-800",
  yellow: "bg-amber-100 text-amber-800",
  blue: "bg-sky-100 text-sky-800",
  green: "bg-emerald-100 text-emerald-800",
};

const zonePanelClassName: Record<AccountProfileDetail["history"][number]["zone"], string> = {
  red: "border-rose-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,244,246,0.95))]",
  yellow:
    "border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,249,235,0.95))]",
  blue: "border-sky-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,247,255,0.95))]",
  green:
    "border-emerald-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(240,253,244,0.95))]",
};

const strategyLabelByKey = new Map(CHECKIN_STRATEGY_CARDS.map((card) => [card.key, card.title]));

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string | null): string {
  if (!value) {
    return "No recent check-ins";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

function formatRelativeLabel(value: string | null): string {
  if (!value) {
    return "No activity yet";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return diffMinutes < 2 ? "Just now" : `${diffMinutes} min ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
}

export function ProfileDetailView({ profile }: ProfileDetailViewProps) {
  return (
    <div className="space-y-6">
      <GlassCard variant="soft" accent className="overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4">
            <ProfileAvatar avatarKey={profile.avatar} name={profile.name} size="xl" />
            <div>
              <Badge>Profile View</Badge>
              <h1 className="mt-4 text-[2.1rem] tracking-[-0.05em] text-dark sm:text-[2.5rem]">
                {profile.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Review this profile&apos;s recent check-ins in one clean history view, then start a
                new one whenever another reset is needed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className={cn(toolkitButtonSecondaryClass, "gap-2")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Profiles
            </Link>
            <Link
              href={`/check-in/profile?profileId=${encodeURIComponent(profile.id)}`}
              className={cn(toolkitButtonPrimaryClass, "gap-2")}
            >
              Start New Check-In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <GlassCard variant="default" className="rounded-[2rem] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary-dark">
            <Sparkles className="h-4 w-4" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">Quick Stats</p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-white/74 bg-white/86 px-4 py-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/62">
                Check-ins
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-dark">
                {profile.checkinCount}
              </p>
            </div>
            <div className="rounded-[1.25rem] border border-white/74 bg-white/86 px-4 py-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/62">
                Last active
              </p>
              <p className="mt-2 text-base font-semibold text-dark">
                {formatRelativeLabel(profile.lastCheckinAt)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.35rem] border border-white/72 bg-white/86 px-4 py-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/62">
              Recent timestamp
            </p>
            <p className="mt-2 text-sm font-semibold text-dark">{formatDateTime(profile.lastCheckinAt)}</p>
          </div>

          <div className="mt-5">
            <div className="grid gap-3">
              <Link
                href={`/check-in/profile?profileId=${encodeURIComponent(profile.id)}`}
                className={cn(toolkitButtonPrimaryClass, "w-full justify-center gap-2")}
              >
                Start New Check-In
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/strategies/saved?profileId=${encodeURIComponent(profile.id)}`}
                className={cn(toolkitButtonSecondaryClass, "w-full justify-center gap-2")}
              >
                View Saved Strategies
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </GlassCard>

        <GlassCard variant="default" className="rounded-[2rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-primary-dark">
              <History className="h-4 w-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                Check-In History
              </p>
            </div>
            <Badge>{profile.checkinCount} total</Badge>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Each entry shows the zone, feeling, strategies used, and when the check-in happened.
          </p>

          {profile.history.length > 0 ? (
            <ol className="relative mt-6 space-y-4 before:absolute before:bottom-0 before:left-[15px] before:top-3 before:w-px before:bg-white/90">
              {profile.history.map((item) => {
                const strategyLabels = item.strategyKeys
                  .map((strategyKey) => strategyLabelByKey.get(strategyKey) ?? strategyKey)
                  .filter(Boolean);

                return (
                  <li key={item.id} className="relative pl-10">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute left-0 top-5 h-8 w-8 rounded-full border-4 border-white shadow-sm",
                        item.zone === "red" && "bg-rose-500",
                        item.zone === "yellow" && "bg-amber-400",
                        item.zone === "blue" && "bg-sky-500",
                        item.zone === "green" && "bg-emerald-500"
                      )}
                    />

                    <article
                      className={cn(
                        "rounded-[1.5rem] border px-5 py-5 shadow-[0_22px_44px_-34px_rgba(79,140,255,0.22)]",
                        zonePanelClassName[item.zone]
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={cn(
                                "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]",
                                zoneChipClassName[item.zone]
                              )}
                            >
                              {item.zone} zone
                            </span>
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatDateTime(item.createdAt)}
                            </span>
                          </div>
                          <h2 className="mt-3 text-[1.2rem] font-semibold tracking-[-0.02em] text-dark">
                            {item.feeling}
                          </h2>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.2rem] border border-white/74 bg-white/78 px-4 py-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/62">
                          Strategies used
                        </p>
                        {strategyLabels.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {strategyLabels.map((label) => (
                              <span
                                key={`${item.id}-${label}`}
                                className="rounded-full border border-primary/14 bg-primary/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-dark"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            No saved strategies for this check-in.
                          </p>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="mt-6 rounded-[1.4rem] border border-white/72 bg-white/84 px-5 py-8 text-center">
              <p className="text-base font-semibold text-dark">No check-ins yet</p>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
                Start a new check-in to build this profile&apos;s history.
              </p>
              <div className="mt-5">
                <Link
                  href={`/check-in/profile?profileId=${encodeURIComponent(profile.id)}`}
                  className={cn(toolkitButtonPrimaryClass, "gap-2")}
                >
                  Start New Check-In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
