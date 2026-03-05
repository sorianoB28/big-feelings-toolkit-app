"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { getMotionPreferences } from "@/lib/motion";
import { cn } from "@/lib/utils";

type MotionCardProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
};

export function MotionCard({ className, children, whileHover, transition, ...props }: MotionCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const motionPreferences = getMotionPreferences(classroomSafeMode, Boolean(prefersReducedMotion));

  return (
    <motion.div
      className={cn("rounded-xl", className)}
      whileHover={
        motionPreferences.disableMotion
          ? undefined
          : (whileHover ?? motionPreferences.cardHover ?? undefined)
      }
      transition={
        transition ?? motionPreferences.transitionDefaults
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}
