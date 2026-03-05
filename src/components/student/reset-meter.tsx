"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";

type ResetMeterProps = {
  resetPoints: number;
  maxPoints?: number;
  className?: string;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function ResetMeter({
  resetPoints,
  maxPoints = 100,
  className,
}: ResetMeterProps) {
  const prefersReducedMotion = useReducedMotion();
  const safeMax = maxPoints > 0 ? maxPoints : 100;
  const clampedPoints = clamp(resetPoints, 0, safeMax);
  const percent = Math.round((clampedPoints / safeMax) * 100);

  return (
    <GlassCard variant="soft" className={cn("p-5 sm:p-6", className)}>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-lg font-semibold text-dark">Reset Meter</h3>
        <p className="mt-1 text-sm text-gray-700">Getting Ready to Return</p>

        <motion.div
          key={percent}
          className="mt-4 h-40 w-40"
          animate={prefersReducedMotion ? undefined : { scale: [1, 1.02, 1] }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
        >
          <CircularProgressbar
            value={percent}
            text={`${percent}%`}
            styles={buildStyles({
              pathColor: "#862633",
              textColor: "#231F20",
              trailColor: "#d9d9d9",
              pathTransitionDuration: prefersReducedMotion ? 0 : 0.7,
              textSize: "16px",
            })}
          />
        </motion.div>

        <p className="mt-3 text-xs font-medium uppercase tracking-wide text-gray-600">
          {clampedPoints} / {safeMax} points
        </p>
      </div>
    </GlassCard>
  );
}
