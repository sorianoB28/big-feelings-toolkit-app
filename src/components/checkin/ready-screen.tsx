"use client";

import { motion } from "framer-motion";
import type { CheckinZoneId } from "@/lib/checkin-options";

type ReadyScreenProps = {
  zone: CheckinZoneId | null;
  vibeWords: string[];
  bodyAreas: string[];
  onStart: () => void;
  onBack: () => void;
  isStarting?: boolean;
};

function zoneCardClass(zone: CheckinZoneId | null): string {
  switch (zone) {
    case "green":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "yellow":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "blue":
      return "border-blue-200 bg-blue-50 text-blue-900";
    case "red":
      return "border-rose-200 bg-rose-50 text-rose-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-800";
  }
}

function zoneLabel(zone: CheckinZoneId | null): string {
  if (!zone) {
    return "Not selected";
  }

  return `${zone.charAt(0).toUpperCase()}${zone.slice(1)} zone`;
}

export function ReadyScreen({
  zone,
  vibeWords,
  bodyAreas,
  onStart,
  onBack,
  isStarting = false,
}: ReadyScreenProps) {
  return (
    <div className="space-y-4">
      <p className="text-xl font-semibold text-dark">Ready to Reset?</p>
      <p className="text-sm text-gray-700">Nice. Let&apos;s pick a tool to help your brain and body reset.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className={`rounded-xl border p-3 ${zoneCardClass(zone)}`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-75">Zone</p>
          <p className="mt-1 text-sm font-semibold">{zoneLabel(zone)}</p>
        </div>

        <div className="rounded-xl border border-border-soft bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vibe words</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {vibeWords.length > 0 ? (
              vibeWords.map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary-dark"
                >
                  {word}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">-</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border-soft bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Body areas</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {bodyAreas.length > 0 ? (
              bodyAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                  {area}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">-</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-dark transition duration-[250ms] ease-out hover:bg-gray-100"
        >
          Back
        </button>
        <motion.button
          type="button"
          onClick={onStart}
          whileTap={{ scale: 0.98 }}
          disabled={isStarting}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStarting ? "Starting..." : "Start my reset"}
        </motion.button>
      </div>
    </div>
  );
}
