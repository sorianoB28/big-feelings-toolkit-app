"use client";

import { cn } from "@/lib/utils";

export type JourneySummaryChip = {
  label: string;
  value: string;
};

type JourneyShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  progressLabel: string;
  progressPercent: number;
  summaryChips?: JourneySummaryChip[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export function JourneyShell({
  eyebrow,
  title,
  description,
  progressLabel,
  progressPercent,
  summaryChips = [],
  children,
  footer,
  className,
  contentClassName,
}: JourneyShellProps) {
  const safeProgressPercent = Math.max(0, Math.min(100, Math.round(progressPercent)));

  return (
    <div className={cn("space-y-6", className)}>
      <header className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-dark sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-gray-700">{description}</p>
          </div>

          <span className="inline-flex min-h-10 items-center rounded-full border border-border-soft bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-700 shadow-sm">
            {progressLabel}
          </span>
        </div>

        <div className="rounded-2xl border border-border-soft bg-white/80 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
            <span>Journey Progress</span>
            <span>{safeProgressPercent}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-primary transition-all duration-[250ms] ease-out"
              style={{ width: `${safeProgressPercent}%` }}
            />
          </div>

          {summaryChips.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {summaryChips.map((chip) => (
                <div
                  key={`${chip.label}-${chip.value}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border-soft bg-surface px-3 py-2 text-sm text-dark shadow-sm"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {chip.label}
                  </span>
                  <span className="font-medium text-dark">{chip.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <div className={cn("rounded-2xl border border-border-soft bg-white/85 p-4 shadow-sm sm:p-5", contentClassName)}>
        {children}
      </div>

      {footer ? (
        <footer className="rounded-2xl border border-border-soft bg-white/85 p-4 shadow-sm sm:p-5">
          {footer}
        </footer>
      ) : null}
    </div>
  );
}
