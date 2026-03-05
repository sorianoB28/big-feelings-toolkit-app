"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const CLUE_OPTIONS = [
  "tight",
  "fast heartbeat",
  "shaky",
  "warm",
  "tense",
  "upset stomach",
] as const;

type BodyAreaKey =
  | "head_face"
  | "chest_heart"
  | "stomach"
  | "hands_arms"
  | "legs_feet";

type BodyAreaDefinition = {
  key: BodyAreaKey;
  label: string;
  prompt: string;
};

const BODY_AREAS: BodyAreaDefinition[] = [
  {
    key: "head_face",
    label: "Head/Face",
    prompt: "What do you notice in your head or face?",
  },
  {
    key: "chest_heart",
    label: "Chest/Heart",
    prompt: "What do you notice in your chest or heart?",
  },
  {
    key: "stomach",
    label: "Stomach",
    prompt: "What do you notice in your stomach?",
  },
  {
    key: "hands_arms",
    label: "Hands/Arms",
    prompt: "What do you notice in your hands or arms?",
  },
  {
    key: "legs_feet",
    label: "Legs/Feet",
    prompt: "What do you notice in your legs or feet?",
  },
];

type AreaSelections = Record<BodyAreaKey, string[]>;

const EMPTY_SELECTIONS: AreaSelections = {
  head_face: [],
  chest_heart: [],
  stomach: [],
  hands_arms: [],
  legs_feet: [],
};

type ViewMode = "map" | "summary";

function getAreaByKey(areaKey: BodyAreaKey): BodyAreaDefinition {
  return BODY_AREAS.find((area) => area.key === areaKey) ?? BODY_AREAS[0];
}

export default function BodyMapTool({
  isRunning,
  elapsedSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [areaSelections, setAreaSelections] = useState<AreaSelections>(EMPTY_SELECTIONS);
  const [activeAreaKey, setActiveAreaKey] = useState<BodyAreaKey | null>(null);
  const [draftClues, setDraftClues] = useState<string[]>([]);
  const previousElapsedRef = useRef(elapsedSeconds);

  const activeArea = activeAreaKey ? getAreaByKey(activeAreaKey) : null;

  const selectedAreas = useMemo(
    () => BODY_AREAS.filter((area) => areaSelections[area.key].length > 0),
    [areaSelections]
  );
  const selectedAreaCount = selectedAreas.length;
  const totalClues = useMemo(
    () => Object.values(areaSelections).reduce((sum, clues) => sum + clues.length, 0),
    [areaSelections]
  );

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (!wasReset) {
      return;
    }

    setViewMode("map");
    setAreaSelections(EMPTY_SELECTIONS);
    setActiveAreaKey(null);
    setDraftClues([]);
  }, [elapsedSeconds]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel:
        viewMode === "summary"
          ? "Review summary"
          : isRunning
            ? "Tap body areas"
            : "Press Start",
      cycleLabel: `${selectedAreaCount} of ${BODY_AREAS.length}`,
      cycleProgressPercent: (selectedAreaCount / BODY_AREAS.length) * 100,
    });
  }, [isRunning, onStatusChange, selectedAreaCount, viewMode]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  function openAreaPicker(areaKey: BodyAreaKey) {
    if (!isRunning) {
      return;
    }

    setActiveAreaKey(areaKey);
    setDraftClues(areaSelections[areaKey]);
  }

  function toggleDraftClue(clue: string) {
    setDraftClues((current) => {
      if (current.includes(clue)) {
        return current.filter((item) => item !== clue);
      }
      if (current.length >= 3) {
        return current;
      }
      return [...current, clue];
    });
  }

  function saveAreaClues() {
    if (!activeAreaKey) {
      return;
    }

    setAreaSelections((current) => ({
      ...current,
      [activeAreaKey]: draftClues,
    }));
    setActiveAreaKey(null);
    setDraftClues([]);
  }

  function clearAreaClues() {
    setDraftClues([]);
  }

  function handleAreaKeyDown(event: React.KeyboardEvent<SVGGElement>, areaKey: BodyAreaKey) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAreaPicker(areaKey);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Body map check-in</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning ? "Tap where you feel it in your body." : "Press start, then tap an area on the body map."}
        </p>
      </div>

      {viewMode === "map" ? (
        <>
          <div className="rounded-xl border border-border-soft bg-surface p-4">
            <div className="mx-auto w-full max-w-xs">
              <svg
                viewBox="0 0 240 450"
                className="h-auto w-full"
                role="img"
                aria-label="Body map silhouette with tappable areas"
              >
                <g className="fill-gray-200 stroke-gray-300">
                  <circle cx="120" cy="48" r="28" />
                  <rect x="90" y="84" width="60" height="148" rx="30" />
                  <rect x="50" y="96" width="26" height="136" rx="13" />
                  <rect x="164" y="96" width="26" height="136" rx="13" />
                  <rect x="96" y="232" width="20" height="140" rx="10" />
                  <rect x="124" y="232" width="20" height="140" rx="10" />
                  <ellipse cx="105" cy="390" rx="22" ry="12" />
                  <ellipse cx="135" cy="390" rx="22" ry="12" />
                </g>

                <g
                  role="button"
                  tabIndex={0}
                  onClick={() => openAreaPicker("head_face")}
                  onKeyDown={(event) => handleAreaKeyDown(event, "head_face")}
                  className="cursor-pointer"
                  aria-label="Select head and face clues"
                >
                  <ellipse
                    cx="120"
                    cy="48"
                    rx="31"
                    ry="30"
                    className={
                      areaSelections.head_face.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                </g>

                <g
                  role="button"
                  tabIndex={0}
                  onClick={() => openAreaPicker("chest_heart")}
                  onKeyDown={(event) => handleAreaKeyDown(event, "chest_heart")}
                  className="cursor-pointer"
                  aria-label="Select chest and heart clues"
                >
                  <ellipse
                    cx="120"
                    cy="142"
                    rx="34"
                    ry="40"
                    className={
                      areaSelections.chest_heart.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                </g>

                <g
                  role="button"
                  tabIndex={0}
                  onClick={() => openAreaPicker("stomach")}
                  onKeyDown={(event) => handleAreaKeyDown(event, "stomach")}
                  className="cursor-pointer"
                  aria-label="Select stomach clues"
                >
                  <ellipse
                    cx="120"
                    cy="204"
                    rx="31"
                    ry="28"
                    className={
                      areaSelections.stomach.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                </g>

                <g
                  role="button"
                  tabIndex={0}
                  onClick={() => openAreaPicker("hands_arms")}
                  onKeyDown={(event) => handleAreaKeyDown(event, "hands_arms")}
                  className="cursor-pointer"
                  aria-label="Select hands and arms clues"
                >
                  <rect
                    x="46"
                    y="95"
                    width="30"
                    height="142"
                    rx="14"
                    className={
                      areaSelections.hands_arms.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                  <rect
                    x="164"
                    y="95"
                    width="30"
                    height="142"
                    rx="14"
                    className={
                      areaSelections.hands_arms.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                </g>

                <g
                  role="button"
                  tabIndex={0}
                  onClick={() => openAreaPicker("legs_feet")}
                  onKeyDown={(event) => handleAreaKeyDown(event, "legs_feet")}
                  className="cursor-pointer"
                  aria-label="Select legs and feet clues"
                >
                  <rect
                    x="94"
                    y="232"
                    width="24"
                    height="160"
                    rx="12"
                    className={
                      areaSelections.legs_feet.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                  <rect
                    x="122"
                    y="232"
                    width="24"
                    height="160"
                    rx="12"
                    className={
                      areaSelections.legs_feet.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                  <ellipse
                    cx="105"
                    cy="392"
                    rx="24"
                    ry="13"
                    className={
                      areaSelections.legs_feet.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                  <ellipse
                    cx="135"
                    cy="392"
                    rx="24"
                    ry="13"
                    className={
                      areaSelections.legs_feet.length > 0
                        ? "fill-primary/35 stroke-primary"
                        : "fill-primary/10 stroke-primary/60"
                    }
                  />
                </g>
              </svg>
            </div>
          </div>

          <div className="rounded-lg border border-border-soft bg-surface p-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Selected areas {selectedAreaCount} / {BODY_AREAS.length}
            </p>
            <p className="mt-1 text-sm text-gray-700">Total clues selected: {totalClues}</p>
            {selectedAreas.length > 0 ? (
              <ul className="mt-2 flex flex-wrap gap-2">
                {selectedAreas.map((area) => (
                  <li
                    key={area.key}
                    className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-dark"
                  >
                    {area.label}: {areaSelections[area.key].join(", ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Tap an area to add clues.</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setViewMode("summary")}
              disabled={totalClues < 1}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Review Summary
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
            >
              Finish Tool
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border-soft bg-surface p-4">
          <p className="text-lg font-semibold text-dark">Body Map Summary</p>
          <p className="mt-1 text-sm text-gray-700">Here&apos;s what you noticed in your body.</p>

          <div className="mt-4 space-y-3">
            {BODY_AREAS.map((area) => (
              <div key={area.key} className="rounded-lg border border-border-soft bg-white p-3">
                <p className="text-sm font-semibold text-dark">{area.label}</p>
                {areaSelections[area.key].length > 0 ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {areaSelections[area.key].map((clue) => (
                      <li
                        key={`${area.key}-${clue}`}
                        className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-dark"
                      >
                        {clue}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">No clues selected.</p>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setViewMode("map")}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
            >
              Back to Body Map
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
            >
              Finish Tool
            </button>
          </div>
        </div>
      )}

      <AnimatePresence>
        {activeArea ? (
          <motion.div
            key="area-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/35 p-4"
            onClick={() => {
              setActiveAreaKey(null);
              setDraftClues([]);
            }}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mx-auto flex min-h-full w-full max-w-md items-end sm:items-center"
            >
              <div
                className="w-full rounded-2xl border border-border-soft bg-white p-4 shadow-lg"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {activeArea.label}
                </p>
                <p className="mt-1 text-base font-semibold text-dark">{activeArea.prompt}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                  Choose up to 3 clues
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {CLUE_OPTIONS.map((clue) => {
                    const selected = draftClues.includes(clue);
                    const maxReached = !selected && draftClues.length >= 3;
                    return (
                      <button
                        key={clue}
                        type="button"
                        onClick={() => toggleDraftClue(clue)}
                        disabled={maxReached}
                        className={`rounded-full border px-3 py-1.5 text-sm font-medium transition duration-[250ms] ease-out ${
                          selected
                            ? "border-primary bg-primary/10 text-primary-dark"
                            : "border-gray-300 bg-white text-dark hover:border-primary/35 hover:bg-primary/5 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                        }`}
                      >
                        {clue}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={saveAreaClues}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={clearAreaClues}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAreaKey(null);
                      setDraftClues([]);
                    }}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

