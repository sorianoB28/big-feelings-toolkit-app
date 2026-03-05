"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { CheckinBodyClueId } from "@/lib/checkin-options";

type CheckinMode = "quick" | "full";

type BodyAreaId = "head" | "chest" | "stomach" | "hands" | "legs";
type BodyChoiceId = "tight" | "shaky" | "fast_heartbeat" | "butterflies" | "tense";

type BodyChoiceOption = {
  id: BodyChoiceId;
  label: string;
  clueId: CheckinBodyClueId;
};

export type BodyAreaSelection = {
  clues: BodyChoiceId[];
  clueIds: CheckinBodyClueId[];
};

export type BodySelectionState = Record<BodyAreaId, BodyAreaSelection>;

type BodyStepProps = {
  mode: CheckinMode;
  value: BodySelectionState;
  onChange: (next: BodySelectionState) => void;
  disabled?: boolean;
};

const AREA_ORDER: BodyAreaId[] = ["head", "chest", "stomach", "hands", "legs"];

const AREA_LABELS: Record<BodyAreaId, string> = {
  head: "Head",
  chest: "Chest",
  stomach: "Stomach",
  hands: "Hands",
  legs: "Legs",
};

const AREA_BUTTON_POSITION: Record<BodyAreaId, string> = {
  head: "top-4 left-1/2 -translate-x-1/2",
  chest: "top-24 left-1/2 -translate-x-1/2",
  stomach: "top-40 left-1/2 -translate-x-1/2",
  hands: "top-[196px] left-1/2 -translate-x-1/2",
  legs: "top-64 left-1/2 -translate-x-1/2",
};

const AREA_OPTIONS: Record<BodyAreaId, BodyChoiceOption[]> = {
  head: [
    { id: "tense", label: "tense", clueId: "tense-face" },
    { id: "tight", label: "tight", clueId: "clenched-jaw" },
    { id: "shaky", label: "shaky", clueId: "headache" },
  ],
  chest: [
    { id: "tight", label: "tight", clueId: "tight-chest" },
    { id: "fast_heartbeat", label: "fast heartbeat", clueId: "heart-racing" },
    { id: "tense", label: "tense", clueId: "fast-breathing" },
  ],
  stomach: [
    { id: "butterflies", label: "butterflies", clueId: "butterflies" },
    { id: "tight", label: "tight", clueId: "upset-stomach" },
    { id: "shaky", label: "shaky", clueId: "nausea" },
  ],
  hands: [
    { id: "shaky", label: "shaky", clueId: "shaky-hands" },
    { id: "tight", label: "tight", clueId: "fists-clenched" },
    { id: "tense", label: "tense", clueId: "stiff-shoulders" },
  ],
  legs: [
    { id: "shaky", label: "shaky", clueId: "pacing" },
    { id: "tense", label: "tense", clueId: "cannot-sit-still" },
    { id: "tight", label: "tight", clueId: "feels-sluggish" },
  ],
};

const QUICK_DEFAULT_CHOICE: Record<BodyAreaId, BodyChoiceId> = {
  head: "tense",
  chest: "tight",
  stomach: "butterflies",
  hands: "shaky",
  legs: "tense",
};

function dedupeClueIds(options: BodyChoiceOption[], choiceIds: BodyChoiceId[]): CheckinBodyClueId[] {
  const selected = new Set(choiceIds);
  const clueIds: CheckinBodyClueId[] = [];

  for (const option of options) {
    if (!selected.has(option.id)) {
      continue;
    }

    if (!clueIds.includes(option.clueId)) {
      clueIds.push(option.clueId);
    }
  }

  return clueIds;
}

export function createEmptyBodySelection(): BodySelectionState {
  return {
    head: { clues: [], clueIds: [] },
    chest: { clues: [], clueIds: [] },
    stomach: { clues: [], clueIds: [] },
    hands: { clues: [], clueIds: [] },
    legs: { clues: [], clueIds: [] },
  };
}

export function getSelectedBodyClueIds(value: BodySelectionState): CheckinBodyClueId[] {
  const clueIds: CheckinBodyClueId[] = [];

  for (const area of AREA_ORDER) {
    for (const clueId of value[area].clueIds) {
      if (!clueIds.includes(clueId)) {
        clueIds.push(clueId);
      }
    }
  }

  return clueIds;
}

export function getSelectedBodyAreaCount(value: BodySelectionState): number {
  return AREA_ORDER.filter((area) => value[area].clueIds.length > 0).length;
}

export function getSelectedBodyAreaLabels(value: BodySelectionState): string[] {
  return AREA_ORDER.flatMap((area) =>
    value[area].clueIds.length > 0 ? [AREA_LABELS[area]] : []
  );
}

function toSelection(options: BodyChoiceOption[], clues: BodyChoiceId[]): BodyAreaSelection {
  const filteredClues = clues.filter((clueId) => options.some((option) => option.id === clueId));
  const dedupedClues = Array.from(new Set(filteredClues));

  return {
    clues: dedupedClues,
    clueIds: dedupeClueIds(options, dedupedClues),
  };
}

export function BodyStep({ mode, value, onChange, disabled = false }: BodyStepProps) {
  const [activeArea, setActiveArea] = useState<BodyAreaId | null>(null);
  const [draftChoices, setDraftChoices] = useState<BodyChoiceId[]>([]);

  const selectedAreaCount = useMemo(() => getSelectedBodyAreaCount(value), [value]);

  function updateArea(area: BodyAreaId, clues: BodyChoiceId[]) {
    const nextSelection = toSelection(AREA_OPTIONS[area], clues);

    onChange({
      ...value,
      [area]: nextSelection,
    });
  }

  function handleAreaTap(area: BodyAreaId) {
    if (disabled) {
      return;
    }

    if (mode === "quick") {
      const currentlySelected = value[area].clueIds.length > 0;
      if (currentlySelected) {
        updateArea(area, []);
        return;
      }

      updateArea(area, [QUICK_DEFAULT_CHOICE[area]]);
      return;
    }

    setDraftChoices(value[area].clues);
    setActiveArea(area);
  }

  function toggleDraftChoice(choiceId: BodyChoiceId) {
    setDraftChoices((current) =>
      current.includes(choiceId)
        ? current.filter((item) => item !== choiceId)
        : [...current, choiceId]
    );
  }

  function closeModal() {
    setActiveArea(null);
    setDraftChoices([]);
  }

  function saveModalSelection() {
    if (!activeArea) {
      return;
    }

    updateArea(activeArea, draftChoices);
    closeModal();
  }

  return (
    <div>
      <p className="text-lg font-semibold text-dark">Where do you feel it?</p>
      <p className="mt-1 text-sm text-gray-700">
        {mode === "quick"
          ? "Tap body areas. Tap again to remove."
          : "Tap an area to pick quick body clues."}
      </p>

      <div className="mt-4 rounded-xl border border-border-soft bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Selected areas: {selectedAreaCount}
        </p>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="relative h-80 w-56 rounded-2xl border border-border-soft bg-white shadow-sm">
          <svg
            viewBox="0 0 224 320"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <circle cx="112" cy="44" r="22" fill="#e5e7eb" />
            <rect x="88" y="70" width="48" height="90" rx="20" fill="#e5e7eb" />
            <rect x="58" y="90" width="26" height="84" rx="13" fill="#e5e7eb" />
            <rect x="140" y="90" width="26" height="84" rx="13" fill="#e5e7eb" />
            <rect x="90" y="162" width="20" height="112" rx="10" fill="#e5e7eb" />
            <rect x="114" y="162" width="20" height="112" rx="10" fill="#e5e7eb" />
          </svg>

          {AREA_ORDER.map((area) => {
            const selected = value[area].clueIds.length > 0;

            return (
              <motion.button
                key={area}
                type="button"
                onClick={() => handleAreaTap(area)}
                whileTap={{ scale: 0.97 }}
                className={`absolute inline-flex min-h-10 min-w-[88px] items-center justify-center rounded-full border px-3 text-xs font-semibold transition duration-[250ms] ease-out ${AREA_BUTTON_POSITION[area]} ${
                  selected
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-dark hover:border-primary/35 hover:bg-primary/5"
                }`}
              >
                {AREA_LABELS[area]}
              </motion.button>
            );
          })}
        </div>
      </div>

      {mode === "full" ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AREA_ORDER.map((area) => {
            const labels = value[area].clues
              .map((choiceId) => AREA_OPTIONS[area].find((option) => option.id === choiceId)?.label)
              .filter((label): label is string => Boolean(label));

            return (
              <div key={`${area}-summary`} className="rounded-lg border border-border-soft bg-white px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {AREA_LABELS[area]}
                </p>
                <p className="mt-1 text-sm text-dark">{labels.length > 0 ? labels.join(", ") : "-"}</p>
              </div>
            );
          })}
        </div>
      ) : null}

      {activeArea ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl border border-border-soft bg-white p-4 shadow-lg">
            <p className="text-base font-semibold text-dark">{AREA_LABELS[activeArea]} clues</p>
            <p className="mt-1 text-sm text-gray-700">Pick what matches right now.</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {AREA_OPTIONS[activeArea].map((option) => {
                const selected = draftChoices.includes(option.id);

                return (
                  <motion.button
                    key={`${activeArea}-${option.id}`}
                    type="button"
                    onClick={() => toggleDraftChoice(option.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-[250ms] ease-out ${
                      selected
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white text-dark hover:border-primary/35 hover:bg-primary/5"
                    }`}
                  >
                    {option.label}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-dark"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveModalSelection}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
