"use client";

import Link from "next/link";
import { memo, startTransition, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ToolkitEditorialImage } from "@/components/toolkit/toolkit-editorial-image";
import { ToolLibraryCard } from "@/components/tools/tool-library-card";
import { Badge } from "@/components/ui/badge";
import {
  toolkitButtonGhostClass,
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import type { ToolCategory } from "@/lib/checkin-options";
import { toolCategoryIcons } from "@/lib/icons";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { TOOLKIT_IMAGE_PLACEHOLDERS } from "@/lib/toolkit-image-placeholders";
import { recommendTools } from "@/lib/tools/recommend";
import type { ToolkitFeelingQuickPick } from "@/lib/tools/toolkit-feelings";
import { cn } from "@/lib/utils";

type FeaturedTool = {
  toolKey: string;
  title: string;
  description: string;
  durationLabel: string;
  categoryLabel: string;
  href: string;
};

type CategoryPreview = {
  category: ToolCategory;
  label: string;
  description: string;
  toolCount: number;
  href: string;
};

type ToolkitHomepageProps = {
  featuredTools: FeaturedTool[];
  categoryPreviews: CategoryPreview[];
  feelingQuickPicks: readonly ToolkitFeelingQuickPick[];
  selectedFeeling: ToolkitFeelingQuickPick | null;
};

const sectionViewport = { once: true, amount: 0.2 } as const;

const quickEntryResultsVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.985,
    transition: {
      duration: 0.18,
      ease: "easeInOut",
      when: "afterChildren",
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const quickEntrySuggestionItemVariants: Variants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: {
      duration: 0.16,
      ease: "easeInOut",
    },
  },
};

const QUICK_ENTRY_RECOMMENDATION_LABELS = [
  "Start here",
  "Also helpful",
  "Try this too",
] as const;

const TOOLKIT_LIBRARY_HREF = "/tools#tool-library";
const QUICK_PICK_SECTION_HREF = "#quick-pick";
const FEATURED_SECTION_HREF = "#featured-tools";

function getQuickEntryRecommendationDescription(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();

  if (normalized.length <= 96) {
    return normalized;
  }

  const cutAt = normalized.lastIndexOf(" ", 92);
  const safeCutAt = cutAt >= 70 ? cutAt : 92;
  return `${normalized.slice(0, safeCutAt).trim()}...`;
}

const HeroBreathingCircle = memo(function HeroBreathingCircle({
  compact = false,
}: {
  compact?: boolean;
}) {
  const prefersReducedMotion = useReducedMotion();
  const shellSize = compact
    ? "h-[15rem] w-[15rem] sm:h-[16.5rem] sm:w-[16.5rem]"
    : "h-[22rem] w-[22rem] sm:h-[25rem] sm:w-[25rem]";
  const outerRing = compact ? "h-[74%] w-[74%]" : "h-[78%] w-[78%]";
  const middleRing = compact ? "h-[56%] w-[56%]" : "h-[60%] w-[60%]";
  const innerCore = compact ? "h-[38%] w-[38%]" : "h-[42%] w-[42%]";

  return (
    <div className={`relative flex ${shellSize} items-center justify-center`}>
      <motion.div
        className="absolute h-full w-full rounded-full border border-primary/15 bg-white/35 blur-[2px] will-change-transform"
        animate={prefersReducedMotion ? undefined : { scale: [0.96, 1.02, 0.96] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className={`absolute ${outerRing} rounded-full border border-secondary/25 will-change-transform`}
        animate={prefersReducedMotion ? undefined : { scale: [0.78, 1.1, 1.1, 0.78] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 11,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.32, 0.54, 1],
              }
        }
      />
      <motion.div
        className={`absolute ${middleRing} rounded-full border border-accent/35 will-change-transform`}
        animate={prefersReducedMotion ? undefined : { scale: [0.82, 1.12, 1.12, 0.82] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 11,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.32, 0.54, 1],
              }
        }
      />
      <motion.div
        className={`gradient-accent absolute ${innerCore} rounded-full shadow-[0_24px_64px_-28px_rgba(79,140,255,0.48)] will-change-transform`}
        animate={prefersReducedMotion ? undefined : { scale: [0.8, 1.14, 1.14, 0.8] }}
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 11,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.32, 0.54, 1],
              }
        }
      />

      <div className="relative z-10 text-center text-dark">
        <p
          className={`font-semibold uppercase text-primary-dark/80 ${
            compact ? "text-[11px] tracking-[0.22em]" : "text-xs tracking-[0.28em]"
          }`}
        >
          Breathe
        </p>
        <p
          className={`mt-3 font-semibold tracking-[-0.04em] ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          In. Hold. Out.
        </p>
        <p className={`mt-3 text-slate-600 ${compact ? "text-xs leading-5" : "text-sm leading-6"}`}>
          A calm rhythm for busy moments.
        </p>
      </div>
    </div>
  );
});

HeroBreathingCircle.displayName = "HeroBreathingCircle";

const FeaturedToolCard = memo(function FeaturedToolCard({ tool }: { tool: FeaturedTool }) {
  return (
    <ToolLibraryCard
      href={tool.href}
      toolKey={tool.toolKey}
      title={tool.title}
      description={tool.description}
      durationLabel={tool.durationLabel}
      categoryLabel={tool.categoryLabel}
    />
  );
});

FeaturedToolCard.displayName = "FeaturedToolCard";

const CategoryPreviewCard = memo(function CategoryPreviewCard({
  category,
}: {
  category: CategoryPreview;
}) {
  const Icon = toolCategoryIcons[category.category];
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={category.href} className="toolkit-focus-ring group block h-full rounded-[2rem] focus-visible:-translate-y-0.5">
        <div className="toolkit-card-shell h-full p-[0.95rem]">
          <div className="relative z-10 flex h-full flex-col">
            <div className="toolkit-card-shell-header relative overflow-hidden p-5 transition duration-[250ms] ease-out group-hover:border-primary/24 group-focus-visible:border-primary/28 group-focus-visible:shadow-[0_18px_34px_-26px_rgba(79,140,255,0.24)] sm:px-5 sm:pb-6 sm:pt-5">
              <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-white/80" />
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-[1.3rem] border border-white/80 bg-white/88 p-3 text-primary-dark shadow-[0_18px_36px_-30px_rgba(79,140,255,0.36)] transition duration-[250ms] ease-out group-hover:scale-[1.03] group-hover:bg-white group-focus-visible:scale-[1.03] group-focus-visible:bg-white">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="self-start rounded-full bg-white/86 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-dark/80 shadow-sm">
                  {category.toolCount} tools
                </span>
              </div>

              <div className="mt-4.5">
                <p className="toolkit-eyebrow text-primary-dark/70">
                  Category Preview
                </p>
                <h3 className="mt-2 text-[1.4rem] font-semibold leading-tight tracking-[-0.04em] text-dark">
                  {category.label}
                </h3>
              </div>
            </div>

            <div className="toolkit-card-shell-body mt-3 flex flex-1 flex-col gap-5 px-5 pb-5 pt-5 transition duration-[250ms] ease-out group-hover:border-primary/20 group-focus-visible:border-primary/24">
              <p className="toolkit-body-copy">{category.description}</p>

              <div className="mt-auto flex items-end justify-between gap-3.5 border-t border-slate-100 pt-4 sm:pt-5">
                <div className="min-w-0">
                  <p className="toolkit-eyebrow text-primary-dark/60">
                    Explore
                  </p>
                  <p className="mt-2 text-sm font-semibold text-dark">Browse {category.label}</p>
                </div>
                <span className="toolkit-chip shrink-0 self-end gap-2 transition duration-[250ms] ease-out group-hover:bg-primary/14 group-focus-visible:bg-primary/14">
                  View Tools
                  <ArrowRight className="h-4 w-4 transition-transform duration-[250ms] ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

CategoryPreviewCard.displayName = "CategoryPreviewCard";

export function ToolkitHomepage({
  featuredTools,
  categoryPreviews,
  feelingQuickPicks,
  selectedFeeling,
}: ToolkitHomepageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const quickEntryResultsRef = useRef<HTMLDivElement | null>(null);
  const totalToolCount = categoryPreviews.reduce((sum, category) => sum + category.toolCount, 0);
  const [optimisticFeelingId, setOptimisticFeelingId] = useState<string | null | undefined>(
    undefined,
  );

  const syncedFeelingId = useMemo(() => {
    const feelingId = searchParams.get("feeling");
    const isKnownFeeling = feelingQuickPicks.some((feeling) => feeling.id === feelingId);

    if (isKnownFeeling) {
      return feelingId;
    }

    return selectedFeeling?.id ?? null;
  }, [feelingQuickPicks, searchParams, selectedFeeling?.id]);

  useEffect(() => {
    if (optimisticFeelingId === undefined) {
      return;
    }

    if (syncedFeelingId === optimisticFeelingId) {
      setOptimisticFeelingId(undefined);
    }
  }, [optimisticFeelingId, syncedFeelingId]);

  const activeFeelingId = optimisticFeelingId === undefined ? syncedFeelingId : optimisticFeelingId;

  const activeFeeling = useMemo(
    () => feelingQuickPicks.find((feeling) => feeling.id === activeFeelingId) ?? null,
    [activeFeelingId, feelingQuickPicks],
  );

  const suggestedTools = useMemo(() => {
    if (!activeFeeling) {
      return [];
    }

    return recommendTools({
      zone: activeFeeling.zone,
      intent: activeFeeling.intent,
      mode: "quick",
      experience: "toolkit",
    }).slice(0, 3);
  }, [activeFeeling]);

  function updateFeelingInUrl(nextFeelingId: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextFeelingId) {
      params.set("feeling", nextFeelingId);
    } else {
      params.delete("feeling");
    }

    const query = params.toString();
    const href = query ? `${pathname}?${query}#quick-pick` : `${pathname}#quick-pick`;
    router.replace(href, { scroll: false });
  }

  function scrollToQuickEntryResults() {
    window.requestAnimationFrame(() => {
      quickEntryResultsRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  }

  function handleFeelingSelect(feelingId: string) {
    if (activeFeelingId === feelingId) {
      scrollToQuickEntryResults();
      return;
    }

    setOptimisticFeelingId(feelingId);
    scrollToQuickEntryResults();

    startTransition(() => {
      updateFeelingInUrl(feelingId);
    });
  }

  function handleFeelingClear() {
    setOptimisticFeelingId(null);

    startTransition(() => {
      updateFeelingInUrl(null);
    });
  }

  return (
    <div className="app-container space-y-16 pb-20 sm:space-y-24 sm:pb-24 lg:space-y-28">
      <section className="pt-3 sm:pt-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-16"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
          <div className="pointer-events-none absolute left-0 top-0 h-40 w-40 rounded-full bg-white/60 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-12 h-52 w-52 rounded-full bg-secondary/14 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-accent/14 blur-3xl" />

          <div className="relative">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <motion.div variants={fadeInUp} className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
                <Badge className="bg-white/80 text-primary-dark shadow-sm">Toolkit Home</Badge>
                <h1 className="mt-5">Reset. Breathe. Refocus.</h1>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
                  Start with the full toolkit library, then open the breathing, grounding, movement,
                  or support tool that fits this moment best.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link href={TOOLKIT_LIBRARY_HREF} className={toolkitButtonPrimaryClass}>
                    Open Toolkit Library
                  </Link>
                  <Link href={QUICK_PICK_SECTION_HREF} className={toolkitButtonSecondaryClass}>
                    Use Quick Entry
                  </Link>
                </div>

                <p className="mt-4 text-sm font-medium text-primary-dark/80">
                  Use this page to orient yourself, then move into the library for the full toolkit experience.
                </p>

                <div className="toolkit-panel mt-8 p-5 text-left sm:p-6">
                  <p className="toolkit-eyebrow">
                    Library-first flow
                  </p>
                  <p className="toolkit-body-copy mt-3">
                    Featured tools, quick-entry suggestions, and category browse are all short paths
                    that lead back into the same calm library destination.
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid gap-4">
                <ToolkitEditorialImage
                  image={TOOLKIT_IMAGE_PLACEHOLDERS.hero}
                  priority
                  sizes="(min-width: 1280px) 38rem, (min-width: 1024px) 48vw, 100vw"
                  className="min-h-[20rem] sm:min-h-[24rem] lg:min-h-[26rem]"
                />

                <div className="grid gap-4 sm:grid-cols-[0.95fr_1.05fr]">
                  <div className="toolkit-panel-strong flex items-center justify-center p-4">
                    <HeroBreathingCircle compact />
                  </div>

                  <div className="toolkit-panel-strong overflow-hidden p-5 sm:p-6">
                    <p className="toolkit-eyebrow">
                      Calm reset
                    </p>
                    <h3 className="mt-3 text-xl tracking-[-0.03em] text-dark">
                      Small resets can change the next part of a day
                    </h3>
                    <p className="toolkit-body-copy mt-3">
                      Start with breathing, grounding, movement, or support tools that make the
                      next few minutes feel steadier and easier to handle.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={staggerContainer} className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                "Open the full library when you want the clearest overview.",
                "Use featured tools and quick entry when you want a faster starting point.",
                "Built for real school-day reset moments without extra friction.",
              ].map((message) => (
                <motion.div
                  key={message}
                  variants={fadeInUp}
                  className="toolkit-panel px-4 py-4 text-sm leading-6 text-slate-600"
                >
                  {message}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={sectionViewport}
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          className="toolkit-surface-level-2 relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(94,211,179,0.1),transparent)]" />
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-white/55 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="max-w-2xl">
              <Badge variant="outline" className="bg-white/78">
                Core Library
              </Badge>
              <h2 className="mt-4">Everything opens into the Toolkit Library</h2>
              <p className="toolkit-body-copy mt-3">
                This is the main destination of the public Toolkit. Featured tools, quick-entry
                recommendations, and category browse all help you arrive here with a little more
                clarity about what to open next.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  `${totalToolCount} tools`,
                  `${categoryPreviews.length} categories`,
                  "Quick feeling entry",
                  "Featured library highlights",
                ].map((item) => (
                  <span
                    key={item}
                    className="toolkit-chip"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={TOOLKIT_LIBRARY_HREF} className={toolkitButtonPrimaryClass}>
                  Open Toolkit Library
                </Link>
                <Link href={FEATURED_SECTION_HREF} className="toolkit-link-inline">
                  See the homepage shortcuts
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                {
                  title: "Featured tools",
                  description: "Start with a few polished highlights, then keep browsing in the full library.",
                },
                {
                  title: "Quick entry",
                  description: "Pick a feeling for a fast recommendation, then open the tool that fits.",
                },
                {
                  title: "Browse categories",
                  description: "Explore calm body, reset mind, release energy, or get support in one place.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="toolkit-panel p-5"
                >
                  <p className="toolkit-eyebrow">
                    {item.title}
                  </p>
                  <p className="toolkit-body-copy mt-3">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        id="featured-tools"
        initial="initial"
        whileInView="animate"
        viewport={sectionViewport}
        variants={staggerContainer}
        className="space-y-8"
      >
        <motion.div variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Library Highlights</Badge>
            <h2 className="mt-4">A few favorite tools from the full library</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              These are a few good places to begin, but they are still part of the larger Toolkit
              Library where you can browse by category, feeling, and need.
            </p>
          </div>
          <Link href={TOOLKIT_LIBRARY_HREF} className="toolkit-link-inline">
            Open the full library
          </Link>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          className="grid gap-5 xl:grid-cols-[0.84fr_1.16fr] xl:items-start"
        >
          <motion.div variants={fadeInUp} className="space-y-4 xl:sticky xl:top-24">
            <ToolkitEditorialImage
              image={TOOLKIT_IMAGE_PLACEHOLDERS.featured}
              sizes="(min-width: 1280px) 28rem, (min-width: 768px) 42vw, 100vw"
              className="min-h-[20rem] sm:min-h-[24rem] lg:min-h-[28rem]"
            />
            <div className="toolkit-panel p-5 sm:p-6">
              <p className="toolkit-eyebrow">
                Featured tools
              </p>
              <p className="toolkit-body-copy mt-3">
                A short set of strong starting points makes it easier to begin here, then keep
                browsing when you want more options.
              </p>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} className="grid gap-5 lg:grid-cols-2">
            {featuredTools.map((tool) => (
              <FeaturedToolCard key={tool.toolKey} tool={tool} />
            ))}
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        id="quick-pick"
        initial="initial"
        whileInView="animate"
        viewport={sectionViewport}
        variants={staggerContainer}
        className="space-y-6"
      >
        <div className="grid gap-8 lg:grid-cols-[0.76fr_1.24fr] lg:items-start lg:gap-10">
          <motion.div variants={fadeInUp} className="space-y-5">
            <ToolkitEditorialImage
              image={TOOLKIT_IMAGE_PLACEHOLDERS.quickEntry}
              sizes="(min-width: 1280px) 26rem, (min-width: 768px) 40vw, 100vw"
              className="min-h-[20rem] sm:min-h-[23rem]"
            />
            <div className="toolkit-panel p-5 sm:p-6">
              <p className="toolkit-eyebrow">
                Quick entry
              </p>
              <p className="toolkit-body-copy mt-3">
                Choose the feeling that fits this moment and we&apos;ll point you toward a few calm,
                practical tools right away.
              </p>
            </div>
          </motion.div>

          <div>
            <motion.div variants={fadeInUp} className="toolkit-surface-level-2 overflow-hidden p-5 sm:p-6 lg:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <Badge>Quick Entry</Badge>
                  <h2 className="mt-4">How are you feeling?</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                    Use this when you want the fastest path into the Toolkit Library. Pick a feeling
                    and we&apos;ll point you toward a few tools that fit this moment right away.
                  </p>
                </div>
                <div className="toolkit-panel hidden px-4 py-3 text-left lg:block">
                  <p className="toolkit-eyebrow text-primary-dark/65">Quick picks</p>
                  <p className="mt-2 text-sm font-semibold text-dark">
                    The fastest route into the library when you need a starting point.
                  </p>
                </div>
              </div>

              <motion.div
                variants={staggerContainer}
                className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {feelingQuickPicks.map((feeling) => {
                  const isSelected = activeFeeling?.id === feeling.id;

                  return (
                    <motion.div key={feeling.id} variants={fadeInUp} layout>
                      <motion.button
                        type="button"
                        onClick={() => handleFeelingSelect(feeling.id)}
                        aria-pressed={isSelected}
                        whileHover={
                          prefersReducedMotion
                            ? undefined
                            : {
                                y: -5,
                                scale: 1.012,
                              }
                        }
                        whileTap={
                          prefersReducedMotion
                            ? undefined
                            : {
                                y: 0,
                                scale: 0.992,
                              }
                        }
                        transition={
                          prefersReducedMotion
                            ? { duration: 0 }
                            : { type: "tween", duration: 0.2, ease: "easeOut" }
                        }
                        className="toolkit-focus-ring group block h-full w-full rounded-[1.8rem] text-left"
                      >
                        <div
                          className={cn(
                            "toolkit-panel-strong relative h-full min-h-[12.5rem] overflow-hidden rounded-[1.8rem] border px-4 py-4 transition duration-[280ms] ease-out group-focus-visible:border-primary/45 group-focus-visible:bg-white/96 group-focus-visible:shadow-[0_28px_60px_-34px_rgba(79,140,255,0.34)] sm:px-5 sm:py-5",
                            isSelected
                              ? "border-primary/48 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,247,255,0.96))] shadow-[0_28px_60px_-34px_rgba(79,140,255,0.34)] ring-1 ring-primary/10"
                              : "border-white/72 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,249,255,0.9))] shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16)] group-hover:border-primary/22 group-hover:bg-white/95 group-hover:shadow-[0_24px_52px_-34px_rgba(79,140,255,0.24)]",
                          )}
                        >
                          <div
                            className={cn(
                              "pointer-events-none absolute inset-x-0 top-0 h-1.5 rounded-b-full transition duration-[280ms] ease-out",
                              isSelected
                                ? "gradient-accent opacity-100"
                                : "bg-white/90 opacity-85 group-hover:opacity-100",
                            )}
                          />
                          <div
                            className={cn(
                              "pointer-events-none absolute inset-x-0 top-0 h-24 transition duration-[280ms] ease-out",
                              isSelected ? "gradient-accent opacity-50" : "opacity-0 group-hover:opacity-20",
                            )}
                          />
                          <motion.div
                            className="pointer-events-none absolute -right-12 -top-4 h-28 w-28 rounded-full bg-primary/18 blur-3xl"
                            animate={
                              prefersReducedMotion || !isSelected
                                ? { opacity: 0 }
                                : { opacity: [0.14, 0.26, 0.14], scale: [0.96, 1.08, 0.96] }
                            }
                            transition={
                              prefersReducedMotion
                                ? { duration: 0 }
                                : { duration: 2.6, ease: "easeInOut", repeat: Infinity }
                            }
                          />

                          <div className="relative flex h-full flex-col gap-5">
                            <div className="flex items-start gap-4">
                              <motion.div
                                className={cn(
                                  "flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] border border-white/84 bg-white/94 shadow-[0_18px_34px_-24px_rgba(79,140,255,0.22)] transition duration-[280ms] ease-out group-focus-visible:bg-white group-hover:bg-white group-hover:shadow-[0_20px_40px_-24px_rgba(79,140,255,0.28)]",
                                  isSelected && "border-primary/16 bg-white shadow-[0_22px_42px_-22px_rgba(79,140,255,0.34)]",
                                )}
                                animate={
                                  prefersReducedMotion || !isSelected
                                    ? undefined
                                    : { scale: [1, 1.04, 1] }
                                }
                                transition={
                                  prefersReducedMotion
                                    ? { duration: 0 }
                                    : { duration: 2.2, ease: "easeInOut", repeat: Infinity }
                                }
                              >
                                <span className="text-[2.35rem] leading-none">{feeling.emoji}</span>
                              </motion.div>

                              <div className="min-w-0 flex-1">
                                <span
                                  className={cn(
                                    "inline-flex min-h-8 items-center rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition duration-[280ms] ease-out group-focus-visible:shadow-sm",
                                    isSelected
                                      ? "bg-primary-dark text-white shadow-[0_14px_30px_-22px_rgba(33,77,147,0.56)]"
                                      : "bg-white/90 text-primary-dark/78 shadow-sm group-hover:bg-white group-hover:text-primary-dark",
                                  )}
                                >
                                  {isSelected ? "Selected now" : "Quick pick"}
                                </span>

                                <h3 className="mt-3 text-[1.28rem] font-semibold tracking-[-0.03em] text-dark sm:text-[1.34rem]">
                                  {feeling.label}
                                </h3>
                                <p className="mt-2 text-sm font-medium leading-6 text-primary-dark/78">
                                  {feeling.helper}
                                </p>
                              </div>
                            </div>

                            <div className="mt-auto border-t border-white/68 pt-4">
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={cn(
                                    "mt-2 h-2.5 w-2.5 shrink-0 rounded-full transition duration-[280ms] ease-out",
                                    isSelected
                                      ? "bg-primary shadow-[0_0_0_4px_rgba(79,140,255,0.14)]"
                                      : "bg-primary-dark/26 group-hover:bg-primary/44",
                                  )}
                                />
                                <p className="text-sm leading-6 text-slate-600">
                                  {isSelected
                                    ? "Recommendations are ready just below."
                                    : "Tap to show matching tools right away."}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>

        <motion.div
          ref={quickEntryResultsRef}
          id="quick-entry-results"
          variants={fadeInUp}
          className="scroll-mt-24"
        >
          <AnimatePresence mode="wait" initial={false}>
            {activeFeeling ? (
              <motion.div
                key={activeFeeling.id}
                variants={prefersReducedMotion ? undefined : quickEntryResultsVariants}
                initial={prefersReducedMotion ? false : "initial"}
                animate={prefersReducedMotion ? undefined : "animate"}
                exit={prefersReducedMotion ? undefined : "exit"}
                transition={prefersReducedMotion ? { duration: 0 } : undefined}
                className="toolkit-surface-level-2 relative overflow-hidden p-6 sm:p-8 lg:p-9"
                aria-live="polite"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(124,108,255,0.08),transparent)]" />
                <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-12 h-28 w-28 rounded-full bg-accent/10 blur-3xl" />

                <div className="relative space-y-6">
                  <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-stretch">
                    <motion.div
                      variants={prefersReducedMotion ? undefined : quickEntrySuggestionItemVariants}
                      className="toolkit-card-shell-body flex h-full flex-col px-5 py-5 sm:px-6 sm:py-6"
                    >
                      <p className="toolkit-eyebrow text-primary-dark/68">Selected feeling</p>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] border border-white/80 bg-white/92 shadow-[0_18px_36px_-24px_rgba(79,140,255,0.28)]">
                          <span className="text-[2.6rem] leading-none">{activeFeeling.emoji}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-2xl font-semibold tracking-[-0.04em] text-dark">
                            {activeFeeling.label}
                          </p>
                          <p className="mt-1 text-sm font-semibold uppercase tracking-[0.16em] text-primary-dark/72">
                            {activeFeeling.helper}
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">
                        Recommendations update right away as you switch feelings.
                      </p>
                    </motion.div>

                    <motion.div
                      variants={prefersReducedMotion ? undefined : quickEntrySuggestionItemVariants}
                      className="toolkit-panel-strong relative h-full overflow-hidden p-5 sm:p-6"
                    >
                      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/85" />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(243,247,255,0.88))]" />

                      <div className="relative flex h-full flex-col justify-between gap-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="max-w-2xl">
                            <div className="flex flex-wrap items-center gap-3">
                              <Badge variant="outline">Feeling selected</Badge>
                              <span className="rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
                                {suggestedTools.length} recommendations
                              </span>
                            </div>
                            <h3 className="mt-4 text-[1.9rem] tracking-[-0.04em] text-dark sm:text-[2.15rem]">
                              Let&apos;s help with that.
                            </h3>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                              These short tools are matched to the feeling you picked and are meant
                              to give you a clean, calm next step right now.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleFeelingClear}
                            className={toolkitButtonGhostClass}
                          >
                            Clear Feeling
                          </button>
                        </div>

                        <div className="toolkit-panel px-4 py-4 sm:px-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="toolkit-eyebrow text-primary-dark/65">Recommended next</p>
                              <p className="mt-1 text-sm font-semibold text-dark">
                                Choose the one that feels easiest to begin.
                              </p>
                            </div>
                            <p className="text-sm font-medium text-slate-600">
                              Short, supportive options for this moment.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div
                    variants={prefersReducedMotion ? undefined : quickEntryResultsVariants}
                    className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {suggestedTools.map((tool, index) => (
                      <motion.div
                        key={`${activeFeeling.id}-${tool.toolKey}`}
                        variants={prefersReducedMotion ? undefined : quickEntrySuggestionItemVariants}
                        className="flex h-full flex-col gap-3"
                      >
                        <div className="px-1">
                          <span className="inline-flex rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-dark">
                            {QUICK_ENTRY_RECOMMENDATION_LABELS[index] ?? `Option ${index + 1}`}
                          </span>
                        </div>
                        <div className="h-full">
                          <ToolLibraryCard
                            href={`/tools/${tool.toolKey}?from=toolkit&feeling=${activeFeeling.id}`}
                            toolKey={tool.toolKey}
                            title={tool.title}
                            description={getQuickEntryRecommendationDescription(tool.reason)}
                            durationLabel={`${Math.max(1, Math.round(tool.durationSeconds / 60))} min`}
                            compact
                          />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="no-feeling"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
                className="toolkit-surface-level-3 rounded-[2rem] p-6 text-center sm:p-8"
              >
                <p className="text-lg font-semibold text-dark">Choose a feeling to get tool ideas.</p>
                <p className="toolkit-body-copy mx-auto mt-3 max-w-2xl">
                  We&apos;ll suggest a few calm-body, focus, movement, or support tools based on what
                  feels hardest right now.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.section>

      <motion.section
        initial="initial"
        whileInView="animate"
        viewport={sectionViewport}
        variants={staggerContainer}
        className="space-y-7"
      >
        <motion.div variants={fadeInUp} className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <Badge>Categories</Badge>
            <h2 className="mt-4">Find the kind of help you need</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Prefer browsing instead of choosing a feeling? Start by support type, then continue
              into the Toolkit Library to open the tool that matches what your body or brain needs next.
            </p>
          </div>
          <Link href={TOOLKIT_LIBRARY_HREF} className="toolkit-link-inline">
            See every category in the library
          </Link>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categoryPreviews.map((category) => (
            <CategoryPreviewCard key={category.category} category={category} />
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="about"
        initial="initial"
        whileInView="animate"
        viewport={sectionViewport}
        variants={staggerContainer}
        className="space-y-8"
      >
        <motion.div
          variants={fadeInUp}
          className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-8 sm:py-10"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(124,108,255,0.06),transparent)]" />
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/55 blur-3xl" />
          <div className="relative space-y-8">
            <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr] lg:items-start">
              <div className="max-w-2xl">
                <Badge>Public + Privacy-Safe</Badge>
                <h2 className="mt-4">A calm toolkit made for real school-day moments</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  Big Feelings Toolkit is a public set of short reset tools for students, teachers,
                  and support staff. It is designed to be simple, privacy-safe, and ready to open in
                  the moments when calm, focus, or support is needed fast.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Open Toolkit mode without a login.",
                  "Short guided tools that feel clear, calm, and usable fast.",
                  "Breathing, grounding, movement, and support in one public library.",
                ].map((item) => (
                  <motion.div key={item} variants={fadeInUp} className="toolkit-panel px-4 py-4 text-sm leading-6 text-slate-600">
                    {item}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="toolkit-panel flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="toolkit-eyebrow">Ready to start?</p>
                <p className="mt-2 text-base font-semibold text-dark sm:text-lg">
                  Open the Toolkit Library for the full experience, or jump back to quick entry when
                  you want a fast starting point.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href={TOOLKIT_LIBRARY_HREF} className={toolkitButtonPrimaryClass}>
                  Open Toolkit Library
                </Link>
                <Link href={QUICK_PICK_SECTION_HREF} className={toolkitButtonGhostClass}>
                  Back to Quick Entry
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
}
