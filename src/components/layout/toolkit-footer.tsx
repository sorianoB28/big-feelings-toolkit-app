"use client";

import { cn } from "@/lib/utils";

type ToolkitFooterProps = {
  className?: string;
};

export function ToolkitFooter({ className }: ToolkitFooterProps) {
  return (
    <footer className={cn("relative z-10 px-4 pb-6 pt-4 sm:px-6 lg:px-8", className)}>
      <div className="mx-auto w-full max-w-6xl">
        <div className="card-glass gradient-border relative overflow-hidden rounded-[1.8rem] border-white/55 bg-white/58 px-4 py-4 shadow-[0_20px_44px_-34px_rgba(15,23,42,0.18)] sm:px-5">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px gradient-accent opacity-75" />
          <div className="relative flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/75">
                Public Toolkit
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Public tools, check-ins, and strategies for school-day reset moments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
