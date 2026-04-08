"use client";

import Link from "next/link";
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, Search, Sparkles, X } from "lucide-react";
import { ToolkitEditorialImage } from "@/components/toolkit/toolkit-editorial-image";
import { ToolLibraryCard } from "@/components/tools/tool-library-card";
import { Badge } from "@/components/ui/badge";
import {
  inputBaseClass,
  toolkitButtonGhostClass,
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import type { ToolCategory } from "@/lib/checkin-options";
import { toolCategoryIcons } from "@/lib/icons";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { TOOLKIT_IMAGE_PLACEHOLDERS } from "@/lib/toolkit-image-placeholders";
import { getToolsGroupedByCategory } from "@/lib/tools/registry";
import { cn } from "@/lib/utils";

type ActiveFilter = "all" | ToolCategory;
type SortOption = "alphabetical" | "shortest" | "longest" | "category";

type FlatTool = {
  id: string;
  toolKey: string;
  title: string;
  category: ToolCategory;
  categoryLabel: string;
  description: string;
  durationSeconds: number;
};

const CATEGORY_GUIDANCE: Record<
  ToolCategory,
  {
    eyebrow: string;
    helper: string;
  }
> = {
  calm_body: {
    eyebrow: "Slow things down",
    helper: "Breathing and body-based tools for when your body needs steadiness first.",
  },
  release_energy: {
    eyebrow: "Use energy safely",
    helper: "Movement tools for when your body needs to push, shake, or move the feeling through.",
  },
  reset_mind: {
    eyebrow: "Get clear again",
    helper:
      "Grounding and focus tools for when your thoughts feel scattered, foggy, or overloaded.",
  },
  get_support: {
    eyebrow: "Reach out clearly",
    helper:
      "Support tools for moments when you want help, scripts, or calm words from a trusted adult.",
  },
};

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "alphabetical", label: "A to Z" },
  { value: "shortest", label: "Shortest Time" },
  { value: "longest", label: "Longest Time" },
  { value: "category", label: "Category" },
];

const TOOL_LIBRARY_ANCHOR_HREF = "/tools#tool-library";
const GUIDED_CHECK_IN_HREF = "/check-in/zone";
const PUBLIC_STRATEGIES_HREF = "/strategies";

function getDurationLabel(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min`;
}

function getLibraryDescription(description: string): string {
  const normalized = description.replace(/\s+/g, " ").trim();

  if (normalized.length <= 92) {
    return normalized;
  }

  const cutAt = normalized.lastIndexOf(" ", 89);
  const safeCutAt = cutAt >= 64 ? cutAt : 89;
  return `${normalized.slice(0, safeCutAt).trim()}...`;
}

function isToolCategory(value: string | null): value is ToolCategory {
  return (
    value === "calm_body" ||
    value === "release_energy" ||
    value === "reset_mind" ||
    value === "get_support"
  );
}

function sortTools(tools: FlatTool[], sortBy: SortOption): FlatTool[] {
  const nextTools = [...tools];

  nextTools.sort((left, right) => {
    if (sortBy === "shortest") {
      return left.durationSeconds - right.durationSeconds || left.title.localeCompare(right.title);
    }

    if (sortBy === "longest") {
      return right.durationSeconds - left.durationSeconds || left.title.localeCompare(right.title);
    }

    if (sortBy === "category") {
      return (
        left.categoryLabel.localeCompare(right.categoryLabel) ||
        left.title.localeCompare(right.title)
      );
    }

    return left.title.localeCompare(right.title);
  });

  return nextTools;
}

function ToolsPageFallback() {
  return (
    <div className="relative">
      <div className="bg-primary/16 pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-secondary/16 pointer-events-none absolute right-[-4rem] top-28 h-80 w-80 rounded-full blur-3xl" />
      <div className="toolkit-drift bg-accent/18 pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
        <section className="mx-auto max-w-6xl">
          <div className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
            <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-white/65 blur-3xl" />
            <div className="bg-secondary/14 pointer-events-none absolute right-10 top-8 h-48 w-48 rounded-full blur-3xl" />

            <div className="relative max-w-2xl">
              <Badge className="bg-white/84 text-primary-dark shadow-sm">
                Full Toolkit Library
              </Badge>
              <h1 className="mt-6">Browse every tool in one calm library grid</h1>
              <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">
                Loading the toolkit library...
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ToolsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const groupedTools = getToolsGroupedByCategory("toolkit");
  const allTools = useMemo<FlatTool[]>(
    () =>
      groupedTools.flatMap((group) =>
        group.tools.map((tool) => ({
          id: tool.toolKey,
          toolKey: tool.toolKey,
          title: tool.title,
          category: tool.category,
          categoryLabel: group.label,
          description: tool.description,
          durationSeconds: tool.durationSeconds,
        }))
      ),
    [groupedTools]
  );
  const totalTools = allTools.length;
  const categoryCount = groupedTools.filter((group) => group.tools.length > 0).length;
  const shortestDurationMinutes =
    allTools.length > 0
      ? Math.max(1, Math.round(Math.min(...allTools.map((tool) => tool.durationSeconds)) / 60))
      : 1;
  const longestDurationMinutes =
    allTools.length > 0
      ? Math.max(1, Math.round(Math.max(...allTools.map((tool) => tool.durationSeconds)) / 60))
      : 3;
  const durationRangeLabel =
    shortestDurationMinutes === longestDurationMinutes
      ? `${shortestDurationMinutes} min`
      : `${shortestDurationMinutes}-${longestDurationMinutes} min`;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("alphabetical");
  const rawCategoryFilter = searchParams.get("category");
  const urlFilter: ActiveFilter = isToolCategory(rawCategoryFilter) ? rawCategoryFilter : "all";
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(urlFilter);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

  useEffect(() => {
    if (activeFilter === urlFilter) {
      return;
    }

    setActiveFilter(urlFilter);
  }, [activeFilter, urlFilter]);

  const activeCategoryGroup = useMemo(
    () =>
      activeFilter === "all"
        ? null
        : (groupedTools.find((group) => group.category === activeFilter) ?? null),
    [activeFilter, groupedTools]
  );
  const activeSortLabel =
    SORT_OPTIONS.find((option) => option.value === sortBy)?.label ?? SORT_OPTIONS[0].label;
  const hasActiveSearch = normalizedSearch.length > 0;

  const visibleTools = useMemo(() => {
    const filteredTools = allTools.filter((tool) => {
      const matchesCategory = activeFilter === "all" || tool.category === activeFilter;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText =
        `${tool.title} ${tool.description} ${tool.categoryLabel}`.toLowerCase();
      return searchableText.includes(normalizedSearch);
    });

    return sortTools(filteredTools, sortBy);
  }, [activeFilter, allTools, normalizedSearch, sortBy]);

  const visibleToolCount = visibleTools.length;
  const hasCustomizedView = activeFilter !== "all" || hasActiveSearch || sortBy !== "alphabetical";

  function handleFilterChange(nextFilter: ActiveFilter) {
    if (nextFilter === activeFilter) {
      return;
    }

    setActiveFilter(nextFilter);
    const params = new URLSearchParams(searchParams.toString());

    if (nextFilter === "all") {
      params.delete("category");
    } else {
      params.set("category", nextFilter);
    }

    const query = params.toString();
    const href = query ? `${pathname}?${query}#tool-library` : `${pathname}#tool-library`;

    router.replace(href, { scroll: false });

    window.requestAnimationFrame(() => {
      document.getElementById("tool-library")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleResetView() {
    setSearchQuery("");
    setSortBy("alphabetical");
    handleFilterChange("all");
  }

  const libraryHeading = activeCategoryGroup
    ? `${activeCategoryGroup.label} Tools`
    : "All Toolkit Tools";
  const libraryDescription = activeCategoryGroup
    ? CATEGORY_GUIDANCE[activeCategoryGroup.category].helper
    : "Browse the full toolkit in one unified grid first, then use search, filters, or sorting only when you want to narrow the view.";

  return (
    <div className="relative">
      <div className="bg-primary/16 pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-secondary/16 pointer-events-none absolute right-[-4rem] top-28 h-80 w-80 rounded-full blur-3xl" />
      <div className="toolkit-drift bg-accent/18 pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
        <motion.section
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mx-auto max-w-6xl"
        >
          <div className="toolkit-surface-level-1 relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
            <div className="pointer-events-none absolute -left-8 top-0 h-40 w-40 rounded-full bg-white/65 blur-3xl" />
            <div className="bg-secondary/14 pointer-events-none absolute right-10 top-8 h-48 w-48 rounded-full blur-3xl" />

            <div className="relative">
              <div className="grid gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
                <motion.div
                  variants={fadeInUp}
                  className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
                >
                  <Badge className="bg-white/84 text-primary-dark shadow-sm">
                    Full Toolkit Library
                  </Badge>
                  <h1 className="mt-6">Browse every tool in one calm library grid</h1>
                  <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg lg:mx-0">
                    Scan the full Big Feelings Toolkit in one professional catalog, then use search,
                    filters, or sorting only when you want to narrow in on the tool that fits this
                    moment best.
                  </p>

                  <motion.div
                    variants={fadeInUp}
                    className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
                  >
                    <Link href={TOOL_LIBRARY_ANCHOR_HREF} className={toolkitButtonPrimaryClass}>
                      Browse the Tool Grid
                    </Link>
                    <Link href={GUIDED_CHECK_IN_HREF} className={toolkitButtonSecondaryClass}>
                      Start a Check-In
                    </Link>
                    <Link href={PUBLIC_STRATEGIES_HREF} className={toolkitButtonSecondaryClass}>
                      View Strategies
                    </Link>
                  </motion.div>

                  <div className="toolkit-panel mt-8 p-5 text-left sm:p-6">
                    <p className="toolkit-eyebrow">Full-library view</p>
                    <p className="toolkit-body-copy mt-3">
                      The default view keeps the whole toolkit visible, while categories, search,
                      and sorting stay available as lighter supporting controls.
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      If you want the toolkit to narrow the options first, start a check-in or
                      browse the strategies library by category.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="grid gap-4">
                  <ToolkitEditorialImage
                    image={TOOLKIT_IMAGE_PLACEHOLDERS.libraryHero}
                    priority
                    sizes="(min-width: 1280px) 38rem, (min-width: 1024px) 48vw, 100vw"
                    className="min-h-[20rem] sm:min-h-[24rem] lg:min-h-[28rem]"
                  />

                  <div className="grid gap-4 text-left sm:grid-cols-3">
                    <div className="toolkit-panel p-5">
                      <p className="toolkit-eyebrow">{totalTools} tools</p>
                      <p className="toolkit-caption-copy mt-3">
                        One unified grid keeps the library easy to scan and compare.
                      </p>
                    </div>
                    <div className="toolkit-panel p-5">
                      <p className="toolkit-eyebrow">{categoryCount} categories</p>
                      <p className="toolkit-caption-copy mt-3">
                        Filter by support type only when you want a smaller, more focused view.
                      </p>
                    </div>
                    <div className="toolkit-panel p-5">
                      <p className="toolkit-eyebrow">{durationRangeLabel}</p>
                      <p className="toolkit-caption-copy mt-3">
                        Most tools stay short enough for a quick school-day reset.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="tool-library"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
          className="mx-auto mt-14 max-w-6xl scroll-mt-28"
        >
          <div className="toolkit-surface-level-1 relative overflow-hidden px-6 py-7 sm:px-8 sm:py-9">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(94,211,179,0.06),transparent)]" />

            <motion.div variants={fadeInUp} className="relative">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <Badge className="bg-white/84 text-primary-dark shadow-sm">
                    {activeCategoryGroup ? activeCategoryGroup.label : "Complete Library"}
                  </Badge>
                  <h2 className="mt-4 text-[2rem] tracking-[-0.05em] text-dark sm:text-[2.3rem]">
                    {libraryHeading}
                  </h2>
                  <p className="toolkit-body-copy mt-3">{libraryDescription}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="toolkit-chip">
                    {visibleToolCount} tool{visibleToolCount === 1 ? "" : "s"}
                  </div>
                  <div className="toolkit-chip">Sorted: {activeSortLabel}</div>
                </div>
              </div>

              <div className="toolkit-panel mt-7 px-4 py-4 sm:px-5 sm:py-5">
                <div className="space-y-5">
                  <div className="border-white/72 rounded-[1.45rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(244,248,255,0.9))] px-4 py-4 shadow-[0_18px_40px_-34px_rgba(79,140,255,0.18)] sm:px-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="max-w-2xl">
                        <p className="toolkit-eyebrow text-primary-dark/65">
                          Need a starting point?
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Try the guided check-in if you want the app to help narrow down which tool
                          might fit this moment before you browse the full library.
                        </p>
                      </div>
                      <Link
                        href={GUIDED_CHECK_IN_HREF}
                        className={cn(toolkitButtonSecondaryClass, "w-fit")}
                      >
                        Not sure where to begin? Try a check-in
                      </Link>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_17rem_auto] xl:items-end">
                    <div>
                      <p className="toolkit-eyebrow text-primary-dark/65">Search Library</p>
                      <div className="relative mt-2">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-dark/65" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Search breathing, grounding, movement, or support tools..."
                          className={cn(inputBaseClass, "min-h-12 pl-11 pr-11")}
                          aria-label="Search tools"
                        />
                        {searchQuery ? (
                          <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="toolkit-focus-ring absolute right-2 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-primary-dark transition duration-[250ms] ease-out hover:bg-white"
                            aria-label="Clear search"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      <p className="toolkit-eyebrow text-primary-dark/65">Sort</p>
                      <div className="relative mt-2">
                        <ArrowUpDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-dark/65" />
                        <select
                          value={sortBy}
                          onChange={(event) => setSortBy(event.target.value as SortOption)}
                          className={cn(inputBaseClass, "min-h-12 appearance-none pr-12")}
                          aria-label="Sort tools"
                        >
                          {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              Sort: {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {hasCustomizedView ? (
                      <button
                        type="button"
                        onClick={handleResetView}
                        className="toolkit-focus-ring bg-white/78 inline-flex min-h-12 items-center justify-center rounded-full border border-white/75 px-4 text-sm font-semibold text-primary-dark shadow-sm transition duration-[250ms] ease-out hover:-translate-y-0.5 hover:bg-white"
                      >
                        Reset View
                      </button>
                    ) : (
                      <div className="hidden xl:block" />
                    )}
                  </div>

                  <div className="border-t border-white/60 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="toolkit-eyebrow text-primary-dark/65">Browse by Category</p>
                        <p className="mt-2 text-sm text-slate-600">
                          Filters are optional. The full grid is the default view.
                        </p>
                      </div>
                      <p className="text-sm font-medium text-slate-600">
                        Use sort and filters only when you want to narrow the catalog.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleFilterChange("all")}
                      aria-pressed={activeFilter === "all"}
                      className={cn(
                        "toolkit-focus-ring inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-[250ms] ease-out",
                        activeFilter === "all"
                          ? "bg-primary text-white shadow-md"
                          : "bg-white/82 text-primary-dark shadow-sm hover:-translate-y-0.5 hover:bg-white"
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                      All Tools
                      <span
                        className={
                          activeFilter === "all" ? "text-white/80" : "text-primary-dark/70"
                        }
                      >
                        {totalTools}
                      </span>
                    </button>

                    {groupedTools.map((group) => {
                      const Icon = toolCategoryIcons[group.category];
                      const isActive = activeFilter === group.category;

                      return (
                        <button
                          key={group.category}
                          type="button"
                          onClick={() => handleFilterChange(group.category)}
                          aria-pressed={isActive}
                          className={cn(
                            "toolkit-focus-ring inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition duration-[250ms] ease-out",
                            isActive
                              ? "bg-primary text-white shadow-md"
                              : "bg-white/82 text-primary-dark shadow-sm hover:-translate-y-0.5 hover:bg-white"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {group.label}
                          <span className={isActive ? "text-white/80" : "text-primary-dark/70"}>
                            {group.tools.length}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {hasCustomizedView ? (
                    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      {activeCategoryGroup ? (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">
                          {activeCategoryGroup.label}
                        </span>
                      ) : null}
                      {hasActiveSearch ? (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">
                          Search: <span className="font-medium">{deferredSearchQuery.trim()}</span>
                        </span>
                      ) : null}
                      {sortBy !== "alphabetical" ? (
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary-dark">
                          Sorted by {activeSortLabel}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>

            {visibleTools.length > 0 ? (
              <motion.div
                variants={staggerContainer}
                layout
                className="relative mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {visibleTools.map((tool) => (
                  <motion.div key={tool.id} layout variants={fadeInUp} className="h-full">
                    <ToolLibraryCard
                      href={`/tools/${tool.toolKey}?from=toolkit`}
                      toolKey={tool.toolKey}
                      title={tool.title}
                      description={getLibraryDescription(tool.description)}
                      durationLabel={getDurationLabel(tool.durationSeconds)}
                      categoryLabel={tool.categoryLabel}
                      compact
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp} className="relative mt-8">
                <div className="toolkit-surface-level-3 rounded-[2rem] px-6 py-10 text-center sm:px-8">
                  <Badge variant="outline" className="bg-white/80">
                    No results
                  </Badge>
                  <h3 className="mt-4 text-2xl tracking-[-0.04em] text-dark">
                    No tools match that view yet
                  </h3>
                  <p className="toolkit-body-copy mx-auto mt-3 max-w-2xl">
                    Try a different word, clear the filters, or reset the view to bring the full
                    library back into focus.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetView}
                      className={toolkitButtonGhostClass}
                    >
                      Reset View
                    </button>
                    <Link href={GUIDED_CHECK_IN_HREF} className={toolkitButtonPrimaryClass}>
                      Start a Check-In
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<ToolsPageFallback />}>
      <ToolsPageContent />
    </Suspense>
  );
}
