"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ToolLibraryCard } from "@/components/tools/tool-library-card";
import {
  CHECKIN_FEELINGS,
  CHECKIN_STRATEGY_CATEGORIES,
  CHECKIN_ZONES,
  getCheckinRecommendations,
} from "@/lib/checkin";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { useGuidedCheckIn } from "./check-in-provider";

const strategyCategoryLabelByKey = new Map(
  CHECKIN_STRATEGY_CATEGORIES.map((category) => [category.key, category])
);
const feelingLabelByKey = new Map(CHECKIN_FEELINGS.map((feeling) => [feeling.key, feeling.label]));

function getDurationLabel(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min`;
}

export function ResetToolStep() {
  const { state, setTool } = useGuidedCheckIn();
  const selectedZone = CHECKIN_ZONES.find((zone) => zone.key === state.zoneKey) ?? null;

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

  if (!selectedZone || !state.feelingKey) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Reset Tool</Badge>
          <h2 className="mt-4">Complete the earlier check-in steps first.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            This screen uses your zone, feeling, and body clues to recommend the best digital tool
            to try right now.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/check-in/body-clues" className={toolkitButtonPrimaryClass}>
              Go to Body Clues
            </Link>
            <Link href="/check-in/zone" className={toolkitButtonSecondaryClass}>
              Start Over
            </Link>
          </div>
        </section>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Why this step exists
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            The recommendation step connects your check-in choices to the existing Toolkit tools so
            the next action feels specific and grounded.
          </p>
        </aside>
      </div>
    );
  }

  const primaryTool = recommendation.primaryTool;
  const alternateTools = recommendation.alternateTools;
  const selectedFeelingLabel =
    state.feelingDetailLabel ??
    (state.feelingKey ? feelingLabelByKey.get(state.feelingKey) ?? state.feelingKey : null);
  const primaryToolHref = primaryTool
    ? `/tools/${primaryTool.toolKey}?from=check-in&returnTo=${encodeURIComponent(
        "/check-in/more-strategies"
      )}`
    : null;

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Step 4</Badge>
          <h2 className="mt-4">Here is the best digital tool to try next.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            This recommendation uses your zone, feeling, and body clues to connect you to one clear
            tool now, plus a few other options if you want a different fit.
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
            <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
              {selectedFeelingLabel}
            </span>
            <span className="rounded-full border border-white/70 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
              {state.bodyClueKeys.length} body clue{state.bodyClueKeys.length === 1 ? "" : "s"}
            </span>
            <span className="rounded-full border border-primary/12 bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark shadow-sm">
              Guided recommendation
            </span>
          </div>
          {recommendation.supportMessage ? (
            <p className="mt-4 text-sm leading-6 text-slate-600">{recommendation.supportMessage}</p>
          ) : null}
        </aside>
      </section>

      {primaryTool ? (
        <section className="toolkit-surface-level-1 relative overflow-hidden px-5 py-6 sm:px-6 sm:py-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(79,140,255,0.14),rgba(124,108,255,0.08),transparent)]" />
          <div className="pointer-events-none absolute right-0 top-6 h-36 w-36 rounded-full bg-primary/12 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-primary-dark">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                    Best match right now
                  </p>
                </div>
                <h3 className="mt-3 text-[1.7rem] tracking-[-0.04em] text-dark">
                  {primaryTool.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Start with this tool first. When you finish, the flow will continue into More
                  Strategies so you can choose extra support if you still want it.
                </p>
              </div>

              {primaryToolHref ? (
                <Link
                  href={primaryToolHref}
                  onClick={() => setTool(primaryTool.toolKey)}
                  className={`${toolkitButtonPrimaryClass} gap-2 self-start`}
                >
                  Start Recommended Tool
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="h-full">
                <ToolLibraryCard
                  href={primaryToolHref ?? "/tools"}
                  onClick={() => setTool(primaryTool.toolKey)}
                  toolKey={primaryTool.toolKey}
                  title={primaryTool.title}
                  description={primaryTool.description}
                  durationLabel={getDurationLabel(primaryTool.durationSeconds)}
                  compact
                />
              </div>

              <div className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                  Strategy direction
                </p>
                <div className="mt-4 space-y-3">
                  {recommendation.recommendedStrategyCategoryKeys.slice(0, 3).map((categoryKey) => {
                    const category = strategyCategoryLabelByKey.get(categoryKey);

                    if (!category) {
                      return null;
                    }

                    return (
                      <div key={categoryKey} className="rounded-[1.25rem] border border-white/70 bg-white/84 px-4 py-4 shadow-sm">
                        <p className="text-sm font-semibold text-dark">{category.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {category.supportingLine}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {alternateTools.length > 0 ? (
        <section className="toolkit-panel-strong px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                Alternate tools
              </p>
              <h3 className="mt-3 text-[1.45rem] tracking-[-0.03em] text-dark">
                If you want another option, try one of these.
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                These are still matched to your check-in, just not ranked as the first tool to try.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {alternateTools.map((tool) => (
              <ToolLibraryCard
                key={tool.toolKey}
                href={`/tools/${tool.toolKey}?from=check-in&returnTo=${encodeURIComponent(
                  "/check-in/more-strategies"
                )}`}
                onClick={() => setTool(tool.toolKey)}
                toolKey={tool.toolKey}
                title={tool.title}
                description={tool.description}
                durationLabel={getDurationLabel(tool.durationSeconds)}
                compact
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
