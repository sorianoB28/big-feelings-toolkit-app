"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { CheckinZoneId } from "@/lib/checkin-options";
import { recommendTools, type RecommendationIntent, type RecommendationZone } from "@/lib/tools/recommend";

type ResetStyleStepProps = {
  zone: CheckinZoneId | null;
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

export function ResetStyleStep({
  zone,
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
    });
  }, [selectedIntent, zone]);

  return (
    <div>
      <p className="text-lg font-semibold text-dark">Pick your reset</p>
      <p className="mt-1 text-sm text-gray-700">Choose what will help you reset right now.</p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Recommended tools</p>
            <button
              type="button"
              onClick={() => onShowAllTools(selectedIntent)}
              disabled={disabled}
              className="inline-flex min-h-10 items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-dark transition duration-[250ms] ease-out hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Show all tools
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {recommendedTools.map((tool) => (
              <article
                key={tool.toolKey}
                className="rounded-xl border border-border-soft bg-white p-3 shadow-sm"
              >
                <p className="text-sm font-semibold text-dark">{tool.title}</p>
                <p className="mt-1 text-xs text-gray-600">{tool.description}</p>
                <button
                  type="button"
                  onClick={() => onStartTool(tool.toolKey, selectedIntent)}
                  disabled={disabled}
                  className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition duration-[250ms] ease-out hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Start
                </button>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">
          Select a reset style to see your top 3 tool recommendations.
        </p>
      )}
    </div>
  );
}
