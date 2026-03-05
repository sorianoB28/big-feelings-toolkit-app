import type { Transition, Variants } from "framer-motion";

export const transitionDefaults: Transition = {
  duration: 0.3,
  ease: "easeOut",
};

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const cardHover = {
  y: -2,
  boxShadow: "0 16px 26px -18px rgba(35, 31, 32, 0.34)",
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
};

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.03,
    },
  },
};

export type MotionPreferences = {
  disableMotion: boolean;
  transitionDefaults: Transition;
  pageVariants: Variants;
  fadeInUp: Variants;
  cardHover: {
    y: number;
    scale?: number;
    boxShadow?: string;
  } | null;
  hoverLift: { y: number } | null;
  tapScale: { scale: number } | null;
  durations: {
    quick: number;
    standard: number;
    page: number;
  };
};

export function getMotionPreferences(
  classroomSafeMode: boolean,
  prefersReducedMotion = false
): MotionPreferences {
  if (prefersReducedMotion) {
    return {
      disableMotion: true,
      transitionDefaults: { duration: 0 },
      pageVariants: {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
      },
      fadeInUp: {
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 1, y: 0 },
      },
      cardHover: null,
      hoverLift: null,
      tapScale: null,
      durations: {
        quick: 0,
        standard: 0,
        page: 0,
      },
    };
  }

  if (classroomSafeMode) {
    return {
      disableMotion: false,
      transitionDefaults: {
        duration: 0.18,
        ease: "easeOut",
      },
      pageVariants: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      },
      fadeInUp: {
        initial: { opacity: 0, y: 4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 2 },
      },
      cardHover: {
        y: -1,
        boxShadow: "0 10px 22px -18px rgba(35, 31, 32, 0.28)",
      },
      hoverLift: {
        y: -1,
      },
      tapScale: {
        scale: 0.99,
      },
      durations: {
        quick: 0.15,
        standard: 0.18,
        page: 0.2,
      },
    };
  }

  return {
    disableMotion: false,
    transitionDefaults,
    pageVariants,
    fadeInUp,
    cardHover: {
      y: -2,
      scale: 1.02,
      boxShadow: "0 14px 28px -18px rgba(35, 31, 32, 0.34)",
    },
    hoverLift: {
      y: -2,
    },
    tapScale: {
      scale: 0.98,
    },
    durations: {
      quick: 0.2,
      standard: 0.3,
      page: 0.35,
    },
  };
}
