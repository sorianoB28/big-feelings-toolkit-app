"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CheckinZoneId } from "@/lib/checkin-options";
import { MotionCard } from "@/components/animations/motion-card";
import { toolIcons } from "@/lib/icons";
import {
  recommendTools,
  type RecommendationIntent,
  type RecommendationMode,
  type RecommendationZone,
} from "@/lib/tools/recommend";
import { cn } from "@/lib/utils";

type ResetStyleStepProps = {
  zone: CheckinZoneId | null;
  mode?: RecommendationMode | null;
  bodyClues?: readonly string[];
  selectedIntent: RecommendationIntent | null;
  onSelectIntent: (intent: RecommendationIntent) => void;
  onStartTool: (toolKey: string, intent: RecommendationIntent) => void;
  onShowAllTools: (intent: RecommendationIntent) => void;
  disabled?: boolean;
};

const INTENT_OPTIONS: Array<{
  id: RecommendationIntent;
  label: string;
  subtitle: string;
}> = [
  { id: "breathe", label: "Breathe", subtitle: "Slow your body and breath." },
  { id: "move", label: "Move", subtitle: "Release extra energy safely." },
  { id: "ground", label: "Ground", subtitle: "Reconnect with what is around you." },
  { id: "support", label: "Get Support", subtitle: "Reach out to a trusted adult." },
];

function formatDurationLabel(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min`;
}

export function ResetStyleStep({
  zone,
  mode = null,
  bodyClues = [],
  selectedIntent,
  onSelectIntent,
  onStartTool,
  onShowAllTools,
  disabled = false,
}: ResetStyleStepProps) {
  const recommendedTools = useMemo(() => {
    if (!zone || !selectedIntent) {
      return [];
    }

    return recommendTools({
      zone: zone as RecommendationZone,
      intent: selectedIntent,
      mode,
      bodyClues,
    });
  }, [bodyClues, mode, selectedIntent, zone]);

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-700">Pick the kind of reset that fits best right now.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {INTENT_OPTIONS.map((option) => {
          const selected = selectedIntent === option.id;

          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onSelectIntent(option.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              disabled={disabled}
              className={`rounded-xl border px-4 py-3 text-left transition duration-[250ms] ease-out ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border-soft bg-white hover:border-primary/35 hover:bg-primary/5"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <p className="text-base font-semibold text-dark">{option.label}</p>
              <p className="mt-1 text-sm text-gray-700">{option.subtitle}</p>
            </motion.button>
          );
        })}
      </div>

      {selectedIntent && zone ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                Suggested tools
              </p>
              <p className="text-sm text-gray-600">
                Best match first, then two other good options.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onShowAllTools(selectedIntent)}
              disabled={disabled}
              className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-dark transition duration-[250ms] ease-out hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Show all tools
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {recommendedTools.map((tool) => {
              const ToolIcon =
                toolIcons[tool.toolKey as keyof typeof toolIcons] ?? toolIcons.default;
              const isBestMatch = tool.matchKind === "best_match";

              return (
                <MotionCard
                  key={tool.toolKey}
                  className={cn(
                    "h-full rounded-2xl border p-0 shadow-sm",
                    isBestMatch
                      ? "border-primary/30 md:col-span-3 lg:col-span-2"
                      : "border-border-soft"
                  )}
                >
                  <article
                    className={cn(
                      "flex h-full flex-col rounded-2xl border p-4 transition duration-[250ms] ease-out",
                      isBestMatch
                        ? "border-primary/20 bg-primary/5"
                        : "border-transparent bg-white"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={cn(
                          "inline-flex rounded-xl p-2",
                          isBestMatch ? "bg-primary/10 text-primary" : "bg-slate-100 text-dark"
                        )}
                      >
                        <ToolIcon className="h-5 w-5" />
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                            isBestMatch
                              ? "bg-primary text-white"
                              : "border border-border-soft bg-surface text-gray-700"
                          )}
                        >
                          {tool.matchLabel}
                        </span>
                        <span className="rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark">
                          {formatDurationLabel(tool.durationSeconds)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-base font-semibold text-dark">{tool.title}</h3>
                      <p className="mt-2 text-sm text-gray-700">{tool.description}</p>
                    </div>

                    <div className="mt-4 rounded-xl border border-border-soft bg-white/85 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                        Why this fits
                      </p>
                      <p className="mt-1 text-sm text-gray-700">{tool.reason}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onStartTool(tool.toolKey, selectedIntent)}
                      disabled={disabled}
                      className={cn(
                        "mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition duration-[250ms] ease-out disabled:cursor-not-allowed disabled:opacity-60",
                        isBestMatch
                          ? "bg-primary text-white shadow-sm hover:bg-primary-dark"
                          : "border border-primary/20 bg-white text-primary-dark hover:bg-primary/5"
                      )}
                    >
                      {isBestMatch ? "Start Best Match" : "Start Alternate"}
                    </button>
                  </article>
                </MotionCard>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">
          Select a reset style to see your best match and two alternates.
        </p>
      )}
    </div>
  );
}
