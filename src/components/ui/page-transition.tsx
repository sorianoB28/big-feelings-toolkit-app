"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { getRouteTransitionPreferences } from "@/lib/motion";

type PageTransitionProps = {
  children: React.ReactNode;
};

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const motionPreferences = getRouteTransitionPreferences(
    classroomSafeMode,
    Boolean(prefersReducedMotion)
  );

  return (
    <AnimatePresence initial={false}>
      <motion.div
        key={pathname}
        initial={false}
        animate="animate"
        exit="exit"
        variants={motionPreferences.variants}
        transition={motionPreferences.transition}
        className="min-h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
