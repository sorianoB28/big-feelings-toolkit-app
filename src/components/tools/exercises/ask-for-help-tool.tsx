"use client";

import { useEffect, useMemo, useState } from "react";
import { inputBaseClass } from "@/components/ui/form-styles";
import type { ToolRuntimeProps } from "@/lib/tools/registry";

const HELPER_OPTIONS = ["Teacher", "Counselor", "Classmate", "Front office"] as const;
const NEED_OPTIONS = ["a short break", "help getting started", "a calm spot", "a quick check-in"] as const;

export default function AskForHelpTool({ isRunning, onStatusChange }: ToolRuntimeProps) {
  const [helper, setHelper] = useState<(typeof HELPER_OPTIONS)[number]>(HELPER_OPTIONS[0]);
  const [need, setNeed] = useState<(typeof NEED_OPTIONS)[number]>(NEED_OPTIONS[0]);
  const [detail, setDetail] = useState("");

  const script = useMemo(() => {
    const extra = detail.trim().length > 0 ? ` ${detail.trim()}` : "";
    return `Can you help me with ${need}?${extra}`;
  }, [detail, need]);

  useEffect(() => {
    onStatusChange?.({
      phaseLabel: "Plan support",
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
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Get support</p>
        <p className="mt-1 text-base font-semibold text-dark">
          {isRunning ? "Build your ask-for-help sentence." : "Press start when you are ready."}
        </p>
      </div>

      <label className="block text-sm font-medium text-dark">
        Who can help?
        <select
          value={helper}
          onChange={(event) => setHelper(event.target.value as (typeof HELPER_OPTIONS)[number])}
          className={`${inputBaseClass} mt-1`}
        >
          {HELPER_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-dark">
        What do you need?
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
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          className={`${inputBaseClass} mt-1 min-h-24`}
          maxLength={120}
          placeholder="I can share more after I calm down."
        />
      </label>

      <div className="rounded-lg border border-border-soft bg-surface p-3">
        <p className="text-xs uppercase tracking-wide text-gray-500">Support sentence</p>
        <p className="mt-2 text-sm text-dark">
          {helper}, {script}
        </p>
      </div>
    </div>
  );
}

