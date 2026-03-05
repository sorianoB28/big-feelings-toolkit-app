"use client";

import { useEffect, useMemo, useState } from "react";
import { inputBaseClass } from "@/components/ui/form-styles";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const NEED_OPTIONS = [
  "a short break",
  "help getting started",
  "a calm space",
  "someone to listen",
] as const;

const FEELING_OPTIONS = ["overwhelmed", "frustrated", "sad", "worried"] as const;

export default function TalkToTeacherTool({ isRunning, onStatusChange }: ToolRuntimeProps) {
  const [need, setNeed] = useState<(typeof NEED_OPTIONS)[number]>(NEED_OPTIONS[0]);
  const [feeling, setFeeling] = useState<(typeof FEELING_OPTIONS)[number]>(FEELING_OPTIONS[0]);
  const [practiceCount, setPracticeCount] = useState(0);
  const [notes, setNotes] = useState("");

  const supportScript = useMemo(() => {
    const noteSegment = notes.trim().length > 0 ? ` ${notes.trim()}` : "";
    return `I am feeling ${feeling} right now, and I need ${need}.${noteSegment}`;
  }, [feeling, need, notes]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: "Build script",
    });
  }, [onStatusChange]);

  useEffect(() => {
    return () => {
      onStatusChange?.(null);
    };
  }, [onStatusChange]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ask for support</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning ? "Build your support sentence and practice saying it." : "Press start when you are ready."}
        </p>
      </div>

      <label className="block text-sm font-medium text-dark">
        Feeling
        <select
          value={feeling}
          onChange={(event) => setFeeling(event.target.value as (typeof FEELING_OPTIONS)[number])}
          className={`${inputBaseClass} mt-1`}
        >
          {FEELING_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-dark">
        What I need
        <select
          value={need}
          onChange={(event) => setNeed(event.target.value as (typeof NEED_OPTIONS)[number])}
          className={`${inputBaseClass} mt-1`}
        >
          {NEED_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-dark">
        Optional detail
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          maxLength={120}
          className={`${inputBaseClass} mt-1 min-h-24`}
          placeholder="Can we check in after this activity?"
        />
      </label>

      <div className="rounded-lg border border-border-soft bg-surface p-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">Support script</p>
        <p className="mt-2 text-sm text-dark">{supportScript}</p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border-soft bg-surface p-3">
        <p className="text-sm text-gray-700">Practice count: {practiceCount}</p>
        <button
          type="button"
          onClick={() => setPracticeCount((current) => current + 1)}
          className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
        >
          Practiced
        </button>
      </div>
    </div>
  );
}
