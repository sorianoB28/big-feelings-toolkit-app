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
        "gradient-border highlight-sheen relative overflow-hidden rounded-2xl border text-dark",
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
      <motion.div
        className="pointer-events-none absolute inset-x-[14%] top-0 h-16 rounded-full bg-white/55 blur-2xl"
        animate={
          motionPreferences.disableMotion
            ? undefined
            : { opacity: [0.42, 0.72, 0.42], scaleX: [0.94, 1.02, 0.94] }
        }
        transition={
          motionPreferences.disableMotion
            ? undefined
            : { duration: 7.5, ease: "easeInOut", repeat: Infinity }
        }
      />

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
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/2 bg-[linear-gradient(120deg,transparent_16%,rgba(255,255,255,0.48)_48%,transparent_84%)] opacity-25 blur-2xl"
            animate={
              motionPreferences.disableMotion
                ? undefined
                : { x: ["0%", "168%", "0%"], opacity: [0.14, 0.28, 0.14] }
            }
            transition={
              motionPreferences.disableMotion
                ? undefined
                : { duration: 10.5, ease: "easeInOut", repeat: Infinity }
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
