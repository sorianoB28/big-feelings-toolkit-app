"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { MotionCard } from "@/components/animations/motion-card";
import {
  CHECKIN_BODY_CLUE_GROUPS,
  CHECKIN_FEELINGS,
  CHECKIN_ZONES,
  type CheckinBodyClueId,
  type CheckinFeelingId,
  type CheckinZoneId,
} from "@/lib/checkin-options";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
} from "@/components/ui/form-styles";
import type { SaveCheckinActionResult } from "@/app/(app)/students/[id]/checkin/start/actions";

type StartCheckinWizardProps = {
  studentId: string;
  studentName: string;
  action: (formData: FormData) => Promise<SaveCheckinActionResult>;
};

const TOTAL_STEPS = 3;
const MAX_FEELINGS = 2;

function getZoneStyles(zoneId: CheckinZoneId, selected: boolean): string {
  if (!selected) {
    return "border-slate-300 bg-white text-slate-800 hover:border-cyan-400 hover:bg-cyan-50";
  }

  switch (zoneId) {
    case "green":
      return "border-emerald-500 bg-emerald-50 text-emerald-900";
    case "yellow":
      return "border-amber-500 bg-amber-50 text-amber-900";
    case "blue":
      return "border-blue-500 bg-blue-50 text-blue-900";
    case "red":
      return "border-rose-500 bg-rose-50 text-rose-900";
    default:
      return "border-cyan-500 bg-cyan-50 text-cyan-900";
  }
}

export function StartCheckinWizard({
  studentId,
  studentName,
  action,
}: StartCheckinWizardProps) {
  const router = useRouter();
  const [isSaving, startSavingTransition] = useTransition();
  const [step, setStep] = useState(1);
  const [zone, setZone] = useState<CheckinZoneId | null>(null);
  const [feelings, setFeelings] = useState<CheckinFeelingId[]>([]);
  const [includeIntensity, setIncludeIntensity] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [bodyClues, setBodyClues] = useState<CheckinBodyClueId[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progressPercent = Math.round((step / TOTAL_STEPS) * 100);
  const cancelHref = `/students/${studentId}`;

  const canContinue =
    (step === 1 && Boolean(zone)) ||
    (step === 2 && feelings.length > 0) ||
    step === 3;

  function handleToggleFeeling(feelingId: CheckinFeelingId) {
    setFeelings((current) => {
      if (current.includes(feelingId)) {
        return current.filter((item) => item !== feelingId);
      }
      if (current.length >= MAX_FEELINGS) {
        return current;
      }
      return [...current, feelingId];
    });
  }

  function handleToggleBodyClue(clueId: CheckinBodyClueId) {
    setBodyClues((current) =>
      current.includes(clueId) ? current.filter((item) => item !== clueId) : [...current, clueId]
    );
  }

  function handleNext() {
    if (!canContinue || step >= TOTAL_STEPS) {
      return;
    }
    setStep((current) => current + 1);
  }

  function handleBack() {
    if (step <= 1) {
      return;
    }
    setStep((current) => current - 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canContinue || isSaving) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setErrorMessage(null);

    startSavingTransition(async () => {
      try {
        const result = await action(formData);
        if (result.ok) {
          router.push(`/students/${studentId}/checkin/tools?checkinId=${result.checkinId}`);
          return;
        }

        setErrorMessage(result.error);
      } catch {
        setErrorMessage("Unable to save check-in. Please try again.");
      }
    });
  }

  return (
    <section className="app-card p-5 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Start Check-In: {studentName}
        </h1>
        <div className="flex items-center justify-between text-sm font-medium text-slate-600">
          <span>Step {step} of 5</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-cyan-600 transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <input type="hidden" name="zone" value={zone ?? ""} />
        <input type="hidden" name="feelings" value={JSON.stringify(feelings)} />
        <input type="hidden" name="intensity" value={includeIntensity ? String(intensity) : ""} />
        <input type="hidden" name="body_clues" value={JSON.stringify(bodyClues)} />

        {step === 1 ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">How&apos;s your engine right now?</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {CHECKIN_ZONES.map((zoneOption) => {
                const selected = zone === zoneOption.id;
                return (
                  <MotionCard key={zoneOption.id} className="h-full">
                    <button
                      type="button"
                      onClick={() => setZone(zoneOption.id)}
                      className={`min-h-16 w-full rounded-xl border-2 px-4 py-3 text-left text-lg font-semibold transition ${getZoneStyles(
                        zoneOption.id,
                        selected
                      )}`}
                    >
                      <span className="mr-2">{zoneOption.emoji}</span>
                      {zoneOption.label}
                    </button>
                  </MotionCard>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Pick up to 2 feelings</h2>
            <p className="mt-1 text-sm text-slate-600">
              Selected {feelings.length} of {MAX_FEELINGS}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CHECKIN_FEELINGS.map((feeling) => {
                const selected = feelings.includes(feeling.id);
                const maxedOut = !selected && feelings.length >= MAX_FEELINGS;
                return (
                  <button
                    key={feeling.id}
                    type="button"
                    onClick={() => handleToggleFeeling(feeling.id)}
                    disabled={maxedOut}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      selected
                        ? "border-cyan-600 bg-cyan-600 text-white"
                        : "border-slate-300 bg-white text-slate-800 hover:border-cyan-400 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-40"
                    }`}
                  >
                    <span className="mr-1">{feeling.emoji}</span>
                    {feeling.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={includeIntensity}
                  onChange={(event) => setIncludeIntensity(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Add intensity (optional)
              </label>
              {includeIntensity ? (
                <div className="mt-4">
                  <label htmlFor="intensity" className="block text-sm font-medium text-slate-700">
                    Intensity: {intensity}
                  </label>
                  <input
                    id="intensity"
                    type="range"
                    min={1}
                    max={10}
                    value={intensity}
                    onChange={(event) => setIntensity(Number(event.target.value))}
                    className="mt-2 h-2 w-full cursor-pointer accent-cyan-600"
                  />
                  <div className="mt-1 flex justify-between text-xs text-slate-500">
                    <span>1</span>
                    <span>10</span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Where do you feel it?</h2>
            <p className="mt-1 text-sm text-slate-600">Tap anything that matches what you notice.</p>
            <div className="mt-4 space-y-4">
              {CHECKIN_BODY_CLUE_GROUPS.map((group) => (
                <MotionCard key={group.id} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.label}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {group.clues.map((clue) => (
                      <label
                        key={clue.id}
                        className="flex min-h-10 items-center gap-3 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <input
                          type="checkbox"
                          checked={bodyClues.includes(clue.id)}
                          onChange={() => handleToggleBodyClue(clue.id)}
                          className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                        />
                        <span>{clue.label}</span>
                      </label>
                    ))}
                  </div>
                </MotionCard>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={cancelHref}
            className={buttonSecondaryClass}
          >
            Cancel
          </Link>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className={buttonSecondaryClass}
            >
              Back
            </button>
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue}
                className={buttonPrimaryClass}
              >
                Next
              </button>
            ) : (
              <button type="submit" disabled={!canContinue || isSaving} className={buttonPrimaryClass}>
                {isSaving ? "Starting Check-In..." : "Continue to Tools"}
              </button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

