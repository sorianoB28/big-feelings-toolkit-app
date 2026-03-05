"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CHECKIN_FEELINGS, type CheckinFeelingId } from "@/lib/checkin-options";

type FeelingsStepProps = {
  selectedFeelings: CheckinFeelingId[];
  maxSelections: number;
  onToggleFeeling: (feelingId: CheckinFeelingId) => void;
  disabled?: boolean;
};

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export function FeelingsStep({
  selectedFeelings,
  maxSelections,
  onToggleFeeling,
  disabled = false,
}: FeelingsStepProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = normalizeSearch(searchTerm);

  const filteredFeelings = useMemo(() => {
    if (!normalizedSearch) {
      return CHECKIN_FEELINGS;
    }

    return CHECKIN_FEELINGS.filter((feeling) =>
      feeling.label.toLowerCase().includes(normalizedSearch)
    );
  }, [normalizedSearch]);

  const selectedFeelingItems = useMemo(
    () => CHECKIN_FEELINGS.filter((feeling) => selectedFeelings.includes(feeling.id)),
    [selectedFeelings]
  );

  return (
    <div>
      <p className="text-lg font-semibold text-dark">Pick 1-2 vibe words</p>
      <p className="mt-1 text-sm text-gray-700">
        Selected {selectedFeelings.length} of {maxSelections}
      </p>

      <label htmlFor="feeling-search" className="sr-only">
        Search feelings
      </label>
      <input
        id="feeling-search"
        type="text"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="type a feeling..."
        className="mt-3 min-h-11 w-full rounded-lg border border-border-soft bg-white px-3 py-2 text-sm text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />

      <div className="mt-4 rounded-xl border border-border-soft bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Selected</p>
        <div className="mt-2 flex min-h-9 flex-wrap gap-2">
          {selectedFeelingItems.length > 0 ? (
            selectedFeelingItems.map((feeling) => (
              <span
                key={`selected-${feeling.id}`}
                className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary-dark"
              >
                <span>{feeling.emoji}</span>
                <span className="ml-1">{feeling.label}</span>
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">None yet</span>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {filteredFeelings.map((feeling) => {
          const selected = selectedFeelings.includes(feeling.id);
          const atLimit = !selected && selectedFeelings.length >= maxSelections;

          return (
            <motion.button
              key={feeling.id}
              type="button"
              onClick={() => onToggleFeeling(feeling.id)}
              whileTap={{ scale: 0.97 }}
              disabled={disabled || atLimit}
              className={`min-h-10 rounded-full border px-3 py-2 text-left text-sm font-medium transition duration-[250ms] ease-out ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 bg-white text-dark hover:border-primary/35 hover:bg-primary/5"
              } disabled:cursor-not-allowed disabled:opacity-45`}
            >
              <span>{feeling.emoji}</span>
              <span className="ml-1">{feeling.label}</span>
            </motion.button>
          );
        })}
      </div>

      {filteredFeelings.length < 1 ? (
        <p className="mt-3 text-sm text-gray-600">No feelings match that search.</p>
      ) : null}
    </div>
  );
}
