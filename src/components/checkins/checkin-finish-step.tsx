"use client";

import { type FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MotionCard } from "@/components/animations/motion-card";
import { buttonPrimaryClass, buttonSecondaryClass, inputBaseClass } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import type { CloseStudentCheckinActionResult } from "@/app/(app)/students/[id]/checkin/finish/actions";

type ReturnStepType =
  | "sit_down"
  | "open_notebook"
  | "start_assignment"
  | "raise_hand_for_help"
  | "sip_of_water"
  | "other";

type ReturnStepOption = {
  type: ReturnStepType;
  label: string;
};

const RETURN_STEP_OPTIONS: ReturnStepOption[] = [
  { type: "sit_down", label: "Sit down" },
  { type: "open_notebook", label: "Open my notebook" },
  { type: "start_assignment", label: "Start the assignment" },
  { type: "raise_hand_for_help", label: "Raise my hand for help" },
  { type: "sip_of_water", label: "Take a sip of water" },
  { type: "other", label: "Other" },
];

type CheckinFinishStepProps = {
  studentId: string;
  checkinId: string;
  action: (formData: FormData) => Promise<CloseStudentCheckinActionResult>;
};

export function CheckinFinishStep({ studentId, checkinId, action }: CheckinFinishStepProps) {
  const router = useRouter();
  const [isSaving, startSavingTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<ReturnStepType | null>(null);
  const [otherText, setOtherText] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!selectedType) {
      return false;
    }

    if (selectedType === "other") {
      return otherText.trim().length > 0;
    }

    return true;
  }, [otherText, selectedType]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit || isSaving) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setErrorMessage(null);

    startSavingTransition(async () => {
      try {
        const result = await action(formData);
        if (result.ok) {
          router.push(`/students/${studentId}?saved=checkin`);
          return;
        }

        setErrorMessage(result.error);
      } catch {
        setErrorMessage("Unable to close this check-in. Please try again.");
      }
    });
  }

  return (
    <section className="app-card p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="tracking-tight">Nice work. What&apos;s your first step back?</h1>
        <p className="mt-1 text-sm text-gray-700">
          Choose one next action so this check-in can be saved and closed.
        </p>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <fieldset>
          <legend className="sr-only">First step back</legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {RETURN_STEP_OPTIONS.map((option) => (
              <MotionCard key={option.type} className="h-full rounded-xl border border-border-soft p-0">
                <label
                  htmlFor={`return-step-${option.type}`}
                  className={cn(
                    "flex min-h-16 cursor-pointer items-center rounded-xl border px-4 py-3 text-sm font-medium transition duration-[250ms] ease-out",
                    selectedType === option.type
                      ? "border-primary bg-primary/10 text-primary-dark"
                      : "border-transparent bg-white text-dark hover:border-primary/35 hover:bg-primary/5"
                  )}
                >
                  <input
                    id={`return-step-${option.type}`}
                    type="radio"
                    name="return_step_type"
                    value={option.type}
                    checked={selectedType === option.type}
                    onChange={() => setSelectedType(option.type)}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              </MotionCard>
            ))}
          </div>
        </fieldset>

        {selectedType === "other" ? (
          <div>
            <label htmlFor="return_step_text" className="block text-sm font-medium text-dark">
              What is your first step?
            </label>
            <input
              id="return_step_text"
              name="return_step_text"
              type="text"
              value={otherText}
              onChange={(event) => setOtherText(event.target.value)}
              maxLength={80}
              placeholder="Type your first step"
              className={`${inputBaseClass} mt-2`}
            />
          </div>
        ) : (
          <input type="hidden" name="return_step_text" value="" />
        )}

        <div className="flex flex-col gap-3 border-t border-border-soft pt-5 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() =>
              router.push(`/students/${studentId}/checkin/tools?checkinId=${encodeURIComponent(checkinId)}`)
            }
            className={buttonSecondaryClass}
          >
            Back to Tools
          </button>
          <button type="submit" disabled={!canSubmit || isSaving} className={buttonPrimaryClass}>
            {isSaving ? "Saving..." : "Finish Check-In"}
          </button>
        </div>
      </form>
    </section>
  );
}
