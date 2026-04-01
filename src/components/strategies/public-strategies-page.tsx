import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { CheckInImageFrame } from "@/components/checkin-flow/check-in-image-frame";
import { ToolkitFooter } from "@/components/layout/toolkit-footer";
import { ToolkitTopNav } from "@/components/layout/toolkit-top-nav";
import { Badge } from "@/components/ui/badge";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import {
  CHECKIN_STRATEGY_CARDS,
  CHECKIN_STRATEGY_CATEGORIES,
  type CheckinStrategyCard,
  type CheckinStrategyCategory,
} from "@/lib/checkin";

const strategyCardsByCategory = new Map(
  CHECKIN_STRATEGY_CATEGORIES.map((category) => [
    category.key,
    CHECKIN_STRATEGY_CARDS.filter((card) => card.category === category.key),
  ])
);

const totalStrategyCount = CHECKIN_STRATEGY_CARDS.length;
const totalCategoryCount = CHECKIN_STRATEGY_CATEGORIES.length;

function StrategyCardArtwork({
  card,
  category,
}: {
  card: CheckinStrategyCard;
  category: CheckinStrategyCategory;
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
            {category.label}
          </p>
          <p className="mt-3 max-w-[16rem] text-lg font-semibold tracking-[-0.03em] text-dark">
            {card.title}
          </p>
        </div>
      </div>
    </div>
  );
}

function StrategyLibraryCard({
  card,
  category,
}: {
  card: CheckinStrategyCard;
  category: CheckinStrategyCategory;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.95))] shadow-[0_24px_48px_-36px_rgba(79,140,255,0.24)] transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:shadow-[0_28px_56px_-38px_rgba(79,140,255,0.28)]">
      <div className="p-3">
        <StrategyCardArtwork card={card} category={category} />
      </div>

      <div className="px-5 pb-5 pt-1">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
            {category.label}
          </p>
          <h3 className="mt-2 text-[1.12rem] font-semibold tracking-[-0.02em] text-dark">
            {card.title}
          </h3>
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
      </div>
    </article>
  );
}

export function PublicStrategiesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">
      <div className="pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full bg-primary/16 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-24 h-80 w-80 rounded-full bg-secondary/16 blur-3xl" />
      <div className="toolkit-drift pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/18 blur-3xl" />

      <ToolkitTopNav />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-6xl space-y-6">
          <section className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
            <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-white/65 blur-3xl" />
            <div className="pointer-events-none absolute right-10 top-8 h-48 w-48 rounded-full bg-secondary/14 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
              <div className="max-w-3xl">
                <Badge className="bg-white/84 text-primary-dark shadow-sm">
                  Public Strategies Library
                </Badge>
                <h1 className="mt-6">Browse the full coping strategies library.</h1>
                <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                  Explore every strategy already used in the guided check-in, now organized as a
                  standalone public resource you can browse any time.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/check-in" className={toolkitButtonPrimaryClass}>
                    Start a Check-In
                  </Link>
                  <Link href="/tools" className={toolkitButtonSecondaryClass}>
                    Browse Toolkit Library
                  </Link>
                </div>
              </div>

              <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
                <div className="flex items-center gap-2 text-primary-dark">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Built for browsing
                  </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-[1.35rem] border border-white/76 bg-white/84 px-4 py-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                      Categories
                    </p>
                    <p className="mt-2 text-[1.6rem] font-semibold tracking-[-0.03em] text-dark">
                      {totalCategoryCount}
                    </p>
                  </div>

                  <div className="rounded-[1.35rem] border border-white/76 bg-white/84 px-4 py-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                      Strategy Cards
                    </p>
                    <p className="mt-2 text-[1.6rem] font-semibold tracking-[-0.03em] text-dark">
                      {totalStrategyCount}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-slate-600">
                  No check-in is required here. This page is a simple, public browse view for the
                  full strategy library.
                </p>
              </aside>
            </div>
          </section>

          <section className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-primary-dark">
                  <BookOpen className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Browse by category
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Jump straight to the kind of support you want, then scan the cards for an idea
                  that feels doable right now.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CHECKIN_STRATEGY_CATEGORIES.map((category) => (
                  <Link
                    key={category.key}
                    href={`/strategies#${category.key}`}
                    className="rounded-full border border-white/75 bg-white/84 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark shadow-sm transition duration-[220ms] ease-out hover:-translate-y-0.5 hover:bg-white"
                  >
                    {category.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <div className="space-y-5">
            {CHECKIN_STRATEGY_CATEGORIES.map((category) => {
              const cards = strategyCardsByCategory.get(category.key) ?? [];

              return (
                <section
                  key={category.key}
                  id={category.key}
                  className="toolkit-panel-strong scroll-mt-24 px-5 py-5 sm:px-6 sm:py-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                        Strategy category
                      </p>
                      <h2 className="mt-3 text-[1.7rem] tracking-[-0.04em] text-dark">
                        {category.label}
                      </h2>
                    </div>

                    <div className="rounded-full border border-white/75 bg-white/84 px-4 py-2 text-sm font-semibold text-primary-dark shadow-sm">
                      {cards.length} ideas
                    </div>
                  </div>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                    {category.supportingLine}
                  </p>

                  <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                      <StrategyLibraryCard key={card.key} card={card} category={category} />
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
                  Want a guided path?
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Browse here when you want the full strategies library, browse the Toolkit Library
                  when you want tools, or start a check-in if you want the app to narrow the
                  options first.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/tools" className={toolkitButtonSecondaryClass}>
                  Browse Toolkit Library
                </Link>
                <Link href="/check-in" className={toolkitButtonPrimaryClass}>
                  Start a Check-In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <ToolkitFooter />
    </div>
  );
}
