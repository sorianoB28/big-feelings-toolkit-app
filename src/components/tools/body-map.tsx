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

type BodyAreaKey = "head_face" | "chest_heart" | "stomach" | "hands_arms" | "legs_feet";

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

function getAreaShapeClass(isSelected: boolean, isHighlighted: boolean): string {
  if (isSelected) {
    return "fill-sky-400/35 stroke-sky-400 drop-shadow-[0_0_16px_rgba(96,165,250,0.35)]";
  }

  if (isHighlighted) {
    return "fill-sky-300/22 stroke-sky-300/90 drop-shadow-[0_0_12px_rgba(125,211,252,0.24)]";
  }

  return "fill-white/12 stroke-white/35";
}

function getClueChipClass(selected: boolean, disabled: boolean): string {
  if (selected) {
    return "border-sky-300/70 bg-gradient-to-r from-sky-400/25 to-violet-400/25 text-slate-50 shadow-[0_8px_24px_rgba(56,189,248,0.18)]";
  }

  if (disabled) {
    return "cursor-not-allowed border-white/10 bg-white/5 text-slate-400";
  }

  return "border-white/20 bg-white/10 text-slate-100 hover:border-sky-200/45 hover:bg-white/16";
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
  const [hoveredAreaKey, setHoveredAreaKey] = useState<BodyAreaKey | null>(null);
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
    setHoveredAreaKey(null);
    setDraftClues([]);
  }, [elapsedSeconds]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel:
        viewMode === "summary"
          ? "Review summary"
          : isRunning
            ? activeArea
              ? `Checking ${activeArea.label}`
              : "Tap body areas"
            : "Press Start",
      cycleLabel: `${selectedAreaCount} of ${BODY_AREAS.length}`,
      cycleProgressPercent: (selectedAreaCount / BODY_AREAS.length) * 100,
    });
  }, [activeArea, isRunning, onStatusChange, selectedAreaCount, viewMode]);

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

  function closePanel() {
    setActiveAreaKey(null);
    setDraftClues([]);
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
    closePanel();
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
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Body map check-in
        </p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning
            ? "Tap where you feel it in your body."
            : "Press start, then tap an area on the body map."}
        </p>
      </div>

      {viewMode === "map" ? (
        <>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-[28px] border border-sky-100/50 bg-[linear-gradient(140deg,rgba(255,255,255,0.84),rgba(239,246,255,0.72),rgba(245,243,255,0.68))] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Body map
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    Softer highlights help you notice where the feeling is showing up.
                  </p>
                </div>
                <div className="rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-[0_10px_25px_rgba(148,163,184,0.14)] backdrop-blur">
                  {selectedAreaCount} of {BODY_AREAS.length} areas selected
                </div>
              </div>

              <div className="mt-4 rounded-[24px] border border-white/50 bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.45),rgba(255,255,255,0.82)_52%,rgba(237,233,254,0.68))] p-4 shadow-inner shadow-sky-100/60">
                <div className="mx-auto w-full max-w-xs">
                  <svg
                    viewBox="0 0 240 450"
                    className="h-auto w-full"
                    role="img"
                    aria-label="Body map silhouette with tappable areas"
                  >
                    <defs>
                      <linearGradient id="body-map-silhouette" x1="0%" x2="100%" y1="0%" y2="100%">
                        <stop offset="0%" stopColor="#E0F2FE" />
                        <stop offset="100%" stopColor="#EDE9FE" />
                      </linearGradient>
                    </defs>

                    <g className="fill-[url(#body-map-silhouette)] stroke-sky-100/90">
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
                      onMouseEnter={() => setHoveredAreaKey("head_face")}
                      onMouseLeave={() =>
                        setHoveredAreaKey((current) => (current === "head_face" ? null : current))
                      }
                      className="cursor-pointer"
                      aria-label="Select head and face clues"
                    >
                      <ellipse
                        cx="120"
                        cy="48"
                        rx="31"
                        ry="30"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.head_face.length > 0,
                          hoveredAreaKey === "head_face" || activeAreaKey === "head_face"
                        )}`}
                      />
                    </g>

                    <g
                      role="button"
                      tabIndex={0}
                      onClick={() => openAreaPicker("chest_heart")}
                      onKeyDown={(event) => handleAreaKeyDown(event, "chest_heart")}
                      onMouseEnter={() => setHoveredAreaKey("chest_heart")}
                      onMouseLeave={() =>
                        setHoveredAreaKey((current) => (current === "chest_heart" ? null : current))
                      }
                      className="cursor-pointer"
                      aria-label="Select chest and heart clues"
                    >
                      <ellipse
                        cx="120"
                        cy="142"
                        rx="34"
                        ry="40"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.chest_heart.length > 0,
                          hoveredAreaKey === "chest_heart" || activeAreaKey === "chest_heart"
                        )}`}
                      />
                    </g>

                    <g
                      role="button"
                      tabIndex={0}
                      onClick={() => openAreaPicker("stomach")}
                      onKeyDown={(event) => handleAreaKeyDown(event, "stomach")}
                      onMouseEnter={() => setHoveredAreaKey("stomach")}
                      onMouseLeave={() =>
                        setHoveredAreaKey((current) => (current === "stomach" ? null : current))
                      }
                      className="cursor-pointer"
                      aria-label="Select stomach clues"
                    >
                      <ellipse
                        cx="120"
                        cy="204"
                        rx="31"
                        ry="28"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.stomach.length > 0,
                          hoveredAreaKey === "stomach" || activeAreaKey === "stomach"
                        )}`}
                      />
                    </g>

                    <g
                      role="button"
                      tabIndex={0}
                      onClick={() => openAreaPicker("hands_arms")}
                      onKeyDown={(event) => handleAreaKeyDown(event, "hands_arms")}
                      onMouseEnter={() => setHoveredAreaKey("hands_arms")}
                      onMouseLeave={() =>
                        setHoveredAreaKey((current) => (current === "hands_arms" ? null : current))
                      }
                      className="cursor-pointer"
                      aria-label="Select hands and arms clues"
                    >
                      <rect
                        x="46"
                        y="95"
                        width="30"
                        height="142"
                        rx="14"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.hands_arms.length > 0,
                          hoveredAreaKey === "hands_arms" || activeAreaKey === "hands_arms"
                        )}`}
                      />
                      <rect
                        x="164"
                        y="95"
                        width="30"
                        height="142"
                        rx="14"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.hands_arms.length > 0,
                          hoveredAreaKey === "hands_arms" || activeAreaKey === "hands_arms"
                        )}`}
                      />
                    </g>

                    <g
                      role="button"
                      tabIndex={0}
                      onClick={() => openAreaPicker("legs_feet")}
                      onKeyDown={(event) => handleAreaKeyDown(event, "legs_feet")}
                      onMouseEnter={() => setHoveredAreaKey("legs_feet")}
                      onMouseLeave={() =>
                        setHoveredAreaKey((current) => (current === "legs_feet" ? null : current))
                      }
                      className="cursor-pointer"
                      aria-label="Select legs and feet clues"
                    >
                      <rect
                        x="94"
                        y="232"
                        width="24"
                        height="160"
                        rx="12"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.legs_feet.length > 0,
                          hoveredAreaKey === "legs_feet" || activeAreaKey === "legs_feet"
                        )}`}
                      />
                      <rect
                        x="122"
                        y="232"
                        width="24"
                        height="160"
                        rx="12"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.legs_feet.length > 0,
                          hoveredAreaKey === "legs_feet" || activeAreaKey === "legs_feet"
                        )}`}
                      />
                      <ellipse
                        cx="105"
                        cy="392"
                        rx="24"
                        ry="13"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.legs_feet.length > 0,
                          hoveredAreaKey === "legs_feet" || activeAreaKey === "legs_feet"
                        )}`}
                      />
                      <ellipse
                        cx="135"
                        cy="392"
                        rx="24"
                        ry="13"
                        className={`transition-all duration-300 ease-in-out ${getAreaShapeClass(
                          areaSelections.legs_feet.length > 0,
                          hoveredAreaKey === "legs_feet" || activeAreaKey === "legs_feet"
                        )}`}
                      />
                    </g>
                  </svg>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {BODY_AREAS.map((area) => {
                  const hasClues = areaSelections[area.key].length > 0;

                  return (
                    <button
                      key={area.key}
                      type="button"
                      onClick={() => openAreaPicker(area.key)}
                      disabled={!isRunning}
                      className={`rounded-2xl border px-4 py-3 text-left transition duration-300 ease-in-out ${
                        hasClues
                          ? "border-sky-200/80 bg-white/65 shadow-[0_18px_40px_rgba(56,189,248,0.12)]"
                          : "bg-white/38 border-white/55 hover:border-sky-200/75 hover:bg-white/55"
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      <p className="text-sm font-semibold text-slate-800">{area.label}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {hasClues ? areaSelections[area.key].join(", ") : "Tap to add body clues"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="min-h-[320px]">
              <AnimatePresence mode="wait" initial={false}>
                {activeArea ? (
                  <motion.aside
                    key={activeArea.key}
                    initial={{ opacity: 0, x: 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 28 }}
                    transition={{ duration: 0.24, ease: "easeInOut" }}
                    className="h-full rounded-[28px] border border-white/40 bg-[linear-gradient(160deg,rgba(15,23,42,0.78),rgba(30,41,59,0.72),rgba(67,56,202,0.54))] p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.2)] backdrop-blur-2xl"
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/80">
                            Area check-in
                          </p>
                          <p className="mt-2 text-xl font-semibold text-white">
                            {activeArea.label}
                          </p>
                          <p className="mt-2 text-sm text-sky-50/85">{activeArea.prompt}</p>
                        </div>
                        <button
                          type="button"
                          onClick={closePanel}
                          className="hover:bg-white/18 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white transition duration-300 ease-in-out"
                        >
                          Close
                        </button>
                      </div>

                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/70">
                        Pick up to 3 clues
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
                              className={`rounded-full border px-3 py-2 text-sm font-medium transition duration-300 ease-in-out ${getClueChipClass(
                                selected,
                                maxReached
                              )}`}
                            >
                              {clue}
                            </button>
                          );
                        })}
                      </div>

                      <div className="border-white/12 bg-white/8 mt-5 rounded-2xl border p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-100/70">
                          Current picks
                        </p>
                        <p className="mt-2 text-sm text-sky-50/90">
                          {draftClues.length > 0 ? draftClues.join(", ") : "No clues selected yet."}
                        </p>
                      </div>

                      <div className="mt-auto flex flex-col gap-2 pt-5">
                        <button
                          type="button"
                          onClick={saveAreaClues}
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-400 to-violet-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(56,189,248,0.28)] transition duration-300 ease-in-out hover:brightness-105"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={closePanel}
                          className="hover:bg-white/16 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 ease-in-out"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.aside>
                ) : (
                  <motion.aside
                    key="panel-placeholder"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="h-full rounded-[28px] border border-slate-200/80 bg-[linear-gradient(160deg,rgba(255,255,255,0.78),rgba(241,245,249,0.72),rgba(238,242,255,0.7))] p-5 text-slate-800 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Side panel
                    </p>
                    <p className="mt-3 text-lg font-semibold text-slate-800">
                      Choose an area on the map
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      The panel opens here so you can stay grounded in the body map while you add
                      clues.
                    </p>

                    <div className="mt-5 space-y-2">
                      {selectedAreas.length > 0 ? (
                        selectedAreas.map((area) => (
                          <div
                            key={`${area.key}-saved`}
                            className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 shadow-[0_10px_30px_rgba(148,163,184,0.12)]"
                          >
                            <p className="text-sm font-semibold text-slate-800">{area.label}</p>
                            <p className="mt-1 text-xs text-slate-600">
                              {areaSelections[area.key].join(", ")}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-300/90 bg-white/50 px-4 py-5 text-sm text-slate-500">
                          No areas saved yet.
                        </div>
                      )}
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-white/78 rounded-[24px] border border-slate-200/80 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Selected areas
                </p>
                <p className="mt-1 text-sm text-slate-700">Total clues selected: {totalClues}</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {selectedAreaCount} / {BODY_AREAS.length} complete
              </div>
            </div>

            {selectedAreas.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {selectedAreas.map((area) => (
                  <li
                    key={area.key}
                    className="rounded-full border border-sky-200/80 bg-gradient-to-r from-sky-50 to-violet-50 px-3 py-1.5 text-xs font-semibold text-sky-900"
                  >
                    {area.label}: {areaSelections[area.key].join(", ")}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-600">Tap an area to add clues.</p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => setViewMode("summary")}
              disabled={totalClues < 1}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Review Summary
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-300 bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
            >
              Finish Tool
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-[24px] border border-border-soft bg-white/85 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.06)] backdrop-blur sm:p-5">
          <p className="text-lg font-semibold text-dark">Body Map Summary</p>
          <p className="mt-1 text-sm text-gray-700">Here&apos;s what you noticed in your body.</p>

          <div className="mt-4 space-y-3">
            {BODY_AREAS.map((area) => (
              <div key={area.key} className="rounded-2xl border border-border-soft bg-white p-3">
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
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-gray-300 bg-surface px-4 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
            >
              Back to Body Map
            </button>
            <button
              type="button"
              onClick={onFinish}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
            >
              Finish Tool
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
