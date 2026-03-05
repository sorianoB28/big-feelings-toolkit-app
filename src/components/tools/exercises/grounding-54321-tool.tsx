"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { saveGroundingToolActivityAction } from "@/app/(app)/tools/actions";
import { buttonSecondaryClass } from "@/components/ui/form-styles";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const STEPS = [
  { id: "see", label: "5 things you can see", target: 5, placeholder: "Type one thing you can see" },
  { id: "feel", label: "4 things you can feel", target: 4, placeholder: "Type one thing you can feel" },
  { id: "hear", label: "3 things you can hear", target: 3, placeholder: "Type one thing you can hear" },
  { id: "smell", label: "2 things you can smell", target: 2, placeholder: "Type one thing you can smell" },
  { id: "taste", label: "1 thing you can taste", target: 1, placeholder: "Type one thing you can taste" },
] as const;
const ENTRY_MAX_LENGTH = 80;

type StepId = (typeof STEPS)[number]["id"];
type StepEntries = Record<StepId, string[]>;
type StepInputs = Record<StepId, string>;

const INITIAL_ENTRIES: StepEntries = {
  see: [],
  feel: [],
  hear: [],
  smell: [],
  taste: [],
};

const INITIAL_INPUTS: StepInputs = {
  see: "",
  feel: "",
  hear: "",
  smell: "",
  taste: "",
};

function normalizeEntry(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export default function Grounding54321Tool({
  isRunning,
  elapsedSeconds,
  onFinish,
  onStatusChange,
}: ToolRuntimeProps) {
  const searchParams = useSearchParams();
  const checkinId = searchParams.get("checkinId");
  const [stepEntries, setStepEntries] = useState<StepEntries>(INITIAL_ENTRIES);
  const [stepInputs, setStepInputs] = useState<StepInputs>(INITIAL_INPUTS);
  const [isFinishing, setIsFinishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const previousElapsedRef = useRef(elapsedSeconds);

  const completedSteps = useMemo(
    () => STEPS.filter((step) => stepEntries[step.id].length >= step.target).length,
    [stepEntries]
  );
  const allStepsComplete = completedSteps === STEPS.length;
  const phaseLabel = allStepsComplete ? "Ready to finish" : "Grounding";
  const cycleProgressPercent = (completedSteps / STEPS.length) * 100;

  useEffect(() => {
    const wasReset = elapsedSeconds === 0 && previousElapsedRef.current > 0;
    previousElapsedRef.current = elapsedSeconds;

    if (!wasReset) {
      return;
    }

    setStepEntries(INITIAL_ENTRIES);
    setStepInputs(INITIAL_INPUTS);
    setIsFinishing(false);
    setSaveError(null);
  }, [elapsedSeconds]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel,
      cycleLabel: `${Math.min(STEPS.length, completedSteps + 1)} of ${STEPS.length}`,
      cycleProgressPercent,
    });
  }, [completedSteps, cycleProgressPercent, onStatusChange, phaseLabel]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  function updateStepInput(stepId: StepId, value: string) {
    setStepInputs((current) => ({
      ...current,
      [stepId]: value.slice(0, ENTRY_MAX_LENGTH),
    }));
  }

  function addStepEntry(stepId: StepId) {
    if (!isRunning) {
      return;
    }

    const step = STEPS.find((item) => item.id === stepId);
    if (!step) {
      return;
    }

    const normalizedEntry = normalizeEntry(stepInputs[stepId]);
    if (!normalizedEntry) {
      return;
    }

    setStepEntries((current) => {
      if (current[stepId].length >= step.target) {
        return current;
      }

      return {
        ...current,
        [stepId]: [...current[stepId], normalizedEntry],
      };
    });

    setStepInputs((current) => ({
      ...current,
      [stepId]: "",
    }));
  }

  function clearStep(stepId: StepId) {
    setStepEntries((current) => ({
      ...current,
      [stepId]: [],
    }));
    setStepInputs((current) => ({
      ...current,
      [stepId]: "",
    }));
  }

  async function handleFinish() {
    if (!allStepsComplete || isFinishing) {
      return;
    }

    setIsFinishing(true);
    setSaveError(null);

    try {
      const entries = STEPS.flatMap((step) =>
        stepEntries[step.id].map((entryText) => ({
          entryType: step.id,
          entryText,
        }))
      );

      const result = await saveGroundingToolActivityAction({
        checkinId,
        entries,
      });

      if (!result.ok) {
        setSaveError(result.error);
      }
    } catch {
      setSaveError("Grounding notes could not be saved. Your entries still stayed in this session.");
    } finally {
      setIsFinishing(false);
      onFinish();
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Focus reset</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning ? "Move through each sense at your pace." : "Press start to begin the grounding flow."}
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((step) => {
          const currentEntries = stepEntries[step.id];
          const currentInput = stepInputs[step.id];
          const normalizedInput = normalizeEntry(currentInput);
          const currentCount = currentEntries.length;
          const isDone = currentCount >= step.target;
          const isAddDisabled = !isRunning || isDone || normalizedInput.length < 1;

          return (
            <div key={step.id} className="rounded-lg border border-border-soft bg-surface p-3">
              <p className="text-sm font-medium text-dark">{step.label}</p>
              <div className="mt-1 flex items-center justify-between gap-3 text-sm text-gray-700">
                <p>
                  {Math.min(currentCount, step.target)} / {step.target}
                </p>
                {isDone ? (
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Step complete
                  </p>
                ) : null}
              </div>

              <form
                className="mt-2 flex flex-col gap-2 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  addStepEntry(step.id);
                }}
              >
                <input
                  type="text"
                  value={currentInput}
                  onChange={(event) => updateStepInput(step.id, event.target.value)}
                  maxLength={ENTRY_MAX_LENGTH}
                  disabled={!isRunning || isDone}
                  placeholder={step.placeholder}
                  className="min-h-10 w-full rounded-lg border border-border-soft px-3 py-2 text-sm text-dark placeholder:text-gray-400 disabled:bg-gray-100"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isAddDisabled}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => clearStep(step.id)}
                    disabled={currentEntries.length < 1}
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 bg-surface px-3 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Clear
                  </button>
                </div>
              </form>

              {currentEntries.length > 0 ? (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {currentEntries.map((entry, index) => (
                    <li
                      key={`${step.id}-${index}-${entry}`}
                      className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-dark"
                    >
                      {entry}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="text-xs uppercase tracking-wide text-primary-dark">
        Completed steps {completedSteps} / {STEPS.length}
      </p>

      <button
        type="button"
        onClick={handleFinish}
        disabled={!allStepsComplete || isFinishing}
        className={`${buttonSecondaryClass} w-full`}
      >
        {isFinishing ? "Saving..." : "Finish"}
      </button>
      {saveError ? <p className="text-sm text-gray-700">{saveError}</p> : null}
    </div>
  );
}
