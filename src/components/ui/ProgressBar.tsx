"use client";

import { cn } from "@/lib/utils";

const DEFAULT_PROGRESS_GRADIENT = "linear-gradient(90deg, #60A5FA 0%, #7C6CFF 100%)";

type ProgressBarProps = {
  value: number;
  animated?: boolean;
  className?: string;
  fillClassName?: string;
};

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, value));
}

export function normalizeProgressValue(value: number): number {
  return Math.round(clampProgress(value));
}

export function ProgressBar({
  value,
  animated = true,
  className,
  fillClassName,
}: ProgressBarProps) {
  const normalizedValue = normalizeProgressValue(value);

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
      className={cn(
        "relative isolate h-2.5 w-full overflow-hidden rounded-full border border-slate-200/80 bg-slate-200/90",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.18)_inset]",
          !fillClassName && "bg-sky-400",
          fillClassName
        )}
        style={{
          width: `${normalizedValue}%`,
          backgroundImage: fillClassName ? undefined : DEFAULT_PROGRESS_GRADIENT,
          transition: animated ? "width 300ms ease-in-out" : "none",
        }}
      />
    </div>
  );
}
