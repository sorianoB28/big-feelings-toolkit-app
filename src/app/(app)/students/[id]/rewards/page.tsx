import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, Flame, Leaf, Sparkles, Target, Wind } from "lucide-react";
import { getStudentBadges, getStudentProgress } from "@/db/queries/rewards";
import { getAccessibleStudentById } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";
import { AVATARS } from "@/lib/student-options";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";

type StudentRewardsPageProps = {
  params: {
    id: string;
  };
};

const badgeIconMap = {
  sparkles: Sparkles,
  target: Target,
  wind: Wind,
  leaf: Leaf,
  flame: Flame,
  default: Award,
} as const;

function formatAwardedDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function tierClassName(tier: string | null): string {
  if (tier === "gold") {
    return "border-amber-300 bg-amber-50 text-amber-900";
  }

  if (tier === "silver") {
    return "border-slate-300 bg-slate-50 text-slate-900";
  }

  return "border-orange-300 bg-orange-50 text-orange-900";
}

export default async function StudentRewardsPage({ params }: StudentRewardsPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    notFound();
  }

  const [badges, progress] = await Promise.all([
    getStudentBadges(student.id),
    getStudentProgress(student.id),
  ]);
  const avatar = AVATARS.find((item) => item.key === student.avatarKey) ?? null;

  return (
    <section className="space-y-6">
      <section className="app-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {avatar ? (
              <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-sm">
                <Image
                  src={avatar.imageSrc}
                  alt={avatar.label}
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-500 shadow-sm">
                {student.displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="tracking-tight">{student.displayName} Rewards</h1>
              <p className="mt-1 text-sm text-gray-700">Celebrate growth and steady reset habits.</p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Points</p>
            <p className="mt-1 text-2xl font-semibold text-dark">{student.points}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="app-card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-dark">Badges earned</h2>
            <span className="rounded-full border border-border-soft bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700">
              {badges.length} total
            </span>
          </div>

          {badges.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {badges.map((badge) => {
                const Icon = badgeIconMap[badge.iconKey as keyof typeof badgeIconMap] ?? badgeIconMap.default;

                return (
                  <div
                    key={badge.key}
                    className="rounded-xl border border-border-soft bg-white p-4 shadow-sm transition duration-[250ms] ease-out hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tierClassName(
                          badge.tier
                        )}`}
                      >
                        {badge.tier ?? "bronze"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-dark">{badge.title}</p>
                    <p className="mt-1 text-xs text-gray-700">{badge.description}</p>
                    <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-gray-500">
                      Earned {formatAwardedDate(badge.awardedAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border-soft bg-background p-6 text-sm text-gray-700">
              No badges earned yet. Complete a tool to unlock the first badge.
            </div>
          )}
        </article>

        <article className="app-card p-6">
          <h2 className="text-lg font-semibold text-dark">Next up</h2>
          {progress.nextBadge ? (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-dark">{progress.nextBadge.title}</p>
                <p className="mt-1 text-xs text-gray-700">{progress.nextBadge.description}</p>
              </div>
              <div className="rounded-xl border border-border-soft bg-white p-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <span>Progress</span>
                  <span>
                    {progress.nextBadge.current}/{progress.nextBadge.target}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-[250ms] ease-out"
                    style={{ width: `${progress.nextBadge.progressPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-700">
                  {progress.nextBadge.current}/{progress.nextBadge.target}{" "}
                  {progress.nextBadge.progressLabel}
                </p>
              </div>
              <p className="text-xs text-gray-600">
                Total tools: {progress.metrics.totalToolCompletions}
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-border-soft bg-white p-4 text-sm text-gray-700">
              All current badges are complete. Keep using tools to maintain consistency.
            </div>
          )}
        </article>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href={`/students/${student.id}`} className={buttonSecondaryClass}>
          Back to Student
        </Link>
        <Link href={`/students/${student.id}/checkin/start`} className={buttonPrimaryClass}>
          Start Check-In
        </Link>
      </section>
    </section>
  );
}

