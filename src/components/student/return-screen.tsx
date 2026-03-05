"use client";

import { useMemo, useState } from "react";
import { MotionButton } from "@/components/ui/motion-primitives";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

type ReturnStepKey =
  | "sit_down"
  | "open_notebook"
  | "raise_hand"
  | "ask_teacher"
  | "other";

type ReturnStepOption = {
  key: ReturnStepKey;
  label: string;
};

const RETURN_OPTIONS: ReturnStepOption[] = [
  { key: "sit_down", label: "Sit down" },
  { key: "open_notebook", label: "Open my notebook" },
  { key: "raise_hand", label: "Raise my hand" },
  { key: "ask_teacher", label: "Ask teacher for help" },
  { key: "other", label: "Other" },
];

export type ReturnScreenResult = {
  firstStepKey: ReturnStepKey;
  firstStepLabel: string;
  otherText: string;
};

type ReturnScreenProps = {
  zone?: string | null;
  onSubmit: (result: ReturnScreenResult) => void;
  onBack?: () => void;
};

export function ReturnScreen({ zone, onSubmit, onBack }: ReturnScreenProps) {
  const [selectedOption, setSelectedOption] = useState<ReturnStepKey | null>(null);
  const [otherText, setOtherText] = useState("");

  const canSubmit = useMemo(() => {
    if (!selectedOption) {
      return false;
    }

    if (selectedOption === "other") {
      return otherText.trim().length > 0;
    }

    return true;
  }, [otherText, selectedOption]);

  function handleSubmit() {
    if (!selectedOption || !canSubmit) {
      return;
    }

    const selected = RETURN_OPTIONS.find((option) => option.key === selectedOption);
    if (!selected) {
      return;
    }

    onSubmit({
      firstStepKey: selectedOption,
      firstStepLabel: selected.label,
      otherText: selectedOption === "other" ? otherText.trim() : "",
    });
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border-soft bg-white/90 p-6 text-center shadow-sm sm:p-8">
      <p className="text-2xl font-semibold text-dark">Nice work.</p>
      <p className="mt-2 text-sm text-gray-700">Ready to return?</p>
      {zone ? (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-primary">
          Zone: {zone}
        </p>
      ) : null}

      <div className="mt-5 text-left">
        <p className="text-sm font-semibold text-dark">What&apos;s your first step back?</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {RETURN_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setSelectedOption(option.key)}
              className={cn(
                "min-h-12 rounded-lg border px-4 py-2 text-left text-sm font-medium transition duration-[250ms] ease-out",
                selectedOption === option.key
                  ? "border-primary bg-primary/10 text-primary-dark"
                  : "border-gray-300 bg-white text-dark hover:border-primary/35 hover:bg-primary/5"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {selectedOption === "other" ? (
          <input
            value={otherText}
            onChange={(event) => setOtherText(event.target.value)}
            placeholder="Type your first step..."
            className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            maxLength={80}
          />
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <MotionButton
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`${buttonPrimaryClass} min-h-12 min-w-40`}
        >
          Return
        </MotionButton>
        {onBack ? (
          <MotionButton
            type="button"
            onClick={onBack}
            className={`${buttonSecondaryClass} min-h-12 min-w-40`}
          >
            Back
          </MotionButton>
        ) : null}
      </div>
    </div>
  );
}

