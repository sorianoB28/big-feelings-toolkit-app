"use client";

import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

export const BREATHING_BASE_STROKE = "#D8E5FF";
export const BREATHING_ACTIVE_STROKE = "#4F8CFF";
export const BREATHING_ACTIVE_GLOW = "rgba(79, 140, 255, 0.34)";
export const BREATHING_FILL_START = "rgba(124, 108, 255, 0.24)";
export const BREATHING_FILL_END = "rgba(94, 211, 179, 0.5)";
export const BREATHING_STROKE_WIDTH = 4;

type BreathingVisualFrameProps = {
  children: ReactNode;
  className?: string;
  visualClassName?: string;
};

export function BreathingVisualFrame({
  children,
  className,
  visualClassName,
}: BreathingVisualFrameProps) {
  return (
    <GlassCard variant="default" className={cn("relative p-3 sm:p-4", className)}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/10" />

      <div
        className={cn(
          "relative rounded-xl border border-white/35 bg-white/75 p-3 sm:p-4",
          visualClassName
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-primary/10" />
        <div className="relative">{children}</div>
      </div>
    </GlassCard>
  );
}
