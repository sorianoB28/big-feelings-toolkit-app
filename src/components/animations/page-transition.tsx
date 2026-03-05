"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { getMotionPreferences } from "@/lib/motion";

type PageTransitionProps = {
  children: ReactNode;
  className?: string;
};

export function PageTransition({ children, className }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const motionPreferences = getMotionPreferences(classroomSafeMode, Boolean(prefersReducedMotion));

  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      variants={motionPreferences.pageVariants}
      transition={motionPreferences.transitionDefaults}
    >
      {children}
    </motion.div>
  );
}
