"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { getMotionPreferences } from "@/lib/motion";

export function MotionButton({
  disabled,
  whileHover,
  whileTap,
  transition,
  ...props
}: HTMLMotionProps<"button">) {
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const motionPreferences = getMotionPreferences(classroomSafeMode, Boolean(prefersReducedMotion));

  return (
    <motion.button
      disabled={disabled}
      whileHover={
        disabled || motionPreferences.disableMotion
          ? undefined
          : (whileHover ?? motionPreferences.hoverLift ?? undefined)
      }
      whileTap={
        disabled || motionPreferences.disableMotion
          ? undefined
          : (whileTap ?? motionPreferences.tapScale ?? undefined)
      }
      transition={transition ?? motionPreferences.transitionDefaults}
      {...props}
    />
  );
}

export function MotionCard({ whileHover, transition, ...props }: HTMLMotionProps<"div">) {
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const motionPreferences = getMotionPreferences(classroomSafeMode, Boolean(prefersReducedMotion));

  return (
    <motion.div
      whileHover={
        motionPreferences.disableMotion
          ? undefined
          : (whileHover ?? motionPreferences.cardHover ?? undefined)
      }
      transition={transition ?? motionPreferences.transitionDefaults}
      {...props}
    />
  );
}
