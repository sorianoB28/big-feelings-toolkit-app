"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ClassroomSafeToggle } from "@/components/student/classroom-safe-toggle";
import { GlassCard } from "@/components/ui/glass-card";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { cn } from "@/lib/utils";

export const BREATHING_BASE_STROKE = "#cfd4da";
export const BREATHING_ACTIVE_STROKE = "#862633";
export const BREATHING_STROKE_WIDTH = 4;

type BreathingVisualFrameProps = {
  children: ReactNode;
  className?: string;
  visualClassName?: string;
  showAmbientToggle?: boolean;
};

export function BreathingVisualFrame({
  children,
  className,
  visualClassName,
  showAmbientToggle = true,
}: BreathingVisualFrameProps) {
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const ambientAllowed = !classroomSafeMode;

  useEffect(() => {
    if (classroomSafeMode) {
      setAmbientEnabled(false);
    }
  }, [classroomSafeMode]);

  return (
    <GlassCard variant="default" className={cn("relative p-3 sm:p-4", className)}>
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/10" />

      {ambientEnabled && ambientAllowed ? (
        <>
          <motion.div
            className="pointer-events-none absolute -left-8 -top-10 h-36 w-36 rounded-full bg-primary blur-3xl"
            style={{ opacity: 0.06 }}
            animate={
              prefersReducedMotion
                ? undefined
                : { x: [0, 10, 0], y: [0, -8, 0], opacity: [0.05, 0.08, 0.05] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 12, ease: "easeInOut", repeat: Infinity }
            }
          />
          <motion.div
            className="pointer-events-none absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-gray-500 blur-3xl"
            style={{ opacity: 0.05 }}
            animate={
              prefersReducedMotion
                ? undefined
                : { x: [0, -8, 0], y: [0, 8, 0], opacity: [0.04, 0.07, 0.04] }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 14, ease: "easeInOut", repeat: Infinity, delay: 0.4 }
            }
          />
        </>
      ) : null}

      {showAmbientToggle ? (
        <div className="relative mb-2 flex flex-wrap justify-end gap-2">
          <ClassroomSafeToggle />
          <button
            type="button"
            onClick={() => setAmbientEnabled((current) => !current)}
            disabled={!ambientAllowed}
            title={!ambientAllowed ? "Disabled while Classroom-Safe mode is on." : undefined}
            className="inline-flex min-h-9 items-center rounded-md border border-gray-300 bg-white/85 px-2.5 py-1.5 text-xs font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:border-primary/40 hover:bg-primary/5"
            aria-pressed={ambientEnabled}
          >
            Ambient {ambientEnabled && ambientAllowed ? "On" : "Off"}
          </button>
        </div>
      ) : null}

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
