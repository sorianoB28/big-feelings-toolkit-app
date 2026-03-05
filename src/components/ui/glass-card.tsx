"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { getMotionPreferences } from "@/lib/motion";
import { cn } from "@/lib/utils";

type GlassCardVariant = "default" | "soft" | "solid";

type GlassCardProps = HTMLMotionProps<"div"> & {
  variant?: GlassCardVariant;
  accent?: boolean;
  hover?: boolean;
  children?: ReactNode;
};

const variantClassNames: Record<GlassCardVariant, string> = {
  default:
    "bg-white supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:backdrop-blur-md border-white/30 shadow-md",
  soft:
    "bg-white supports-[backdrop-filter]:bg-white/55 supports-[backdrop-filter]:backdrop-blur-sm border-white/25 shadow-sm",
  solid: "bg-white border-border-soft shadow-md",
};

export function GlassCard({
  children,
  className,
  variant = "default",
  accent = false,
  hover = false,
  whileHover,
  transition,
  ...props
}: GlassCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const motionPreferences = getMotionPreferences(classroomSafeMode, Boolean(prefersReducedMotion));

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl border text-dark",
        variantClassNames[variant],
        className
      )}
      whileHover={
        !hover || motionPreferences.disableMotion
          ? undefined
          : (whileHover ?? motionPreferences.cardHover ?? undefined)
      }
      transition={transition ?? motionPreferences.transitionDefaults}
      {...props}
    >
      {accent ? (
        <>
          <motion.div
            className="pointer-events-none absolute -left-8 -top-10 h-28 w-28 rounded-full bg-primary/5 blur-3xl"
            animate={
              motionPreferences.disableMotion
                ? undefined
                : { x: [0, 6, 0], y: [0, -4, 0], opacity: [0.05, 0.08, 0.05] }
            }
            transition={
              motionPreferences.disableMotion
                ? undefined
                : { duration: 10, ease: "easeInOut", repeat: Infinity }
            }
          />
          <motion.div
            className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gray-500/5 blur-3xl"
            animate={
              motionPreferences.disableMotion
                ? undefined
                : { x: [0, -7, 0], y: [0, 5, 0], opacity: [0.05, 0.07, 0.05] }
            }
            transition={
              motionPreferences.disableMotion
                ? undefined
                : { duration: 11, ease: "easeInOut", repeat: Infinity, delay: 0.5 }
            }
          />
        </>
      ) : null}

      <div className="relative z-10">{children as ReactNode}</div>
    </motion.div>
  );
}
