"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CheckinZoneId } from "@/lib/checkin-options";
import { useZoneTheme } from "@/hooks/useZoneTheme";
import { cn } from "@/lib/utils";

type ZoneBackgroundProps = {
  zone: CheckinZoneId | null | undefined;
  className?: string;
};

export function ZoneBackground({ zone, className }: ZoneBackgroundProps) {
  const theme = useZoneTheme(zone);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={theme.zone}
          className="absolute inset-0"
          style={{ backgroundImage: theme.backgroundGradient }}
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
        />
      </AnimatePresence>

      <motion.div
        className="absolute -right-24 top-[-5rem] h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: theme.accentColor, opacity: 0.08 }}
        animate={prefersReducedMotion ? undefined : { x: [0, -14, 0], y: [0, 8, 0] }}
        transition={prefersReducedMotion ? { duration: 0 } : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -left-20 bottom-[-5rem] h-64 w-64 rounded-full blur-3xl"
        style={{ backgroundColor: theme.primaryColor, opacity: 0.07 }}
        animate={prefersReducedMotion ? undefined : { x: [0, 10, 0], y: [0, -8, 0] }}
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.3 }
        }
      />
    </div>
  );
}
