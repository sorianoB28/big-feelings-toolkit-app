"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CalmParticles } from "@/components/animations/calm-particles";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { cn } from "@/lib/utils";

type CalmBackgroundVariant = "default" | "immersive";

type CalmBackgroundProps = {
  variant?: CalmBackgroundVariant;
  showParticles?: boolean;
  showGrid?: boolean;
  className?: string;
};

const VARIANT_STYLES: Record<
  CalmBackgroundVariant,
  {
    leftOrbClassName: string;
    rightOrbClassName: string;
    bottomOrbClassName: string;
  }
> = {
  default: {
    leftOrbClassName: "-left-20 top-16 h-80 w-80 bg-primary/20",
    rightOrbClassName: "right-[-6rem] top-24 h-96 w-96 bg-secondary/18",
    bottomOrbClassName: "bottom-[-5rem] left-1/3 h-72 w-72 bg-accent/20",
  },
  immersive: {
    leftOrbClassName: "-left-24 top-8 h-80 w-80 bg-primary/16",
    rightOrbClassName: "right-[-5rem] top-16 h-96 w-96 bg-secondary/14",
    bottomOrbClassName: "bottom-[-7rem] left-1/3 h-80 w-80 bg-accent/16",
  },
};

export function CalmBackground({
  variant = "default",
  showParticles = false,
  showGrid = true,
  className,
}: CalmBackgroundProps) {
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const reduceVisualMotion = Boolean(prefersReducedMotion) || classroomSafeMode;
  const styles = VARIANT_STYLES[variant];

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div
        className={cn("absolute inset-0 opacity-70", !reduceVisualMotion && "toolkit-gradient-shift")}
        style={
          reduceVisualMotion
            ? {
                backgroundImage:
                  "radial-gradient(circle at top left, rgba(255, 255, 255, 0.7), transparent 38%), radial-gradient(circle at bottom right, rgba(94, 211, 179, 0.18), transparent 32%), var(--gradient-accent)",
                backgroundSize: "170% 170%",
              }
            : undefined
        }
      />

      <motion.div
        className={cn("absolute rounded-full blur-3xl", styles.leftOrbClassName)}
        animate={
          reduceVisualMotion ? undefined : { x: [0, 22, 0], y: [0, -18, 0], scale: [1, 1.06, 1] }
        }
        transition={
          reduceVisualMotion
            ? undefined
            : { duration: 18, ease: "easeInOut", repeat: Infinity }
        }
      />
      <motion.div
        className={cn("absolute rounded-full blur-3xl", styles.rightOrbClassName)}
        animate={
          reduceVisualMotion
            ? undefined
            : { x: [0, -24, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }
        }
        transition={
          reduceVisualMotion
            ? undefined
            : { duration: 24, ease: "easeInOut", repeat: Infinity, delay: 0.4 }
        }
      />
      <motion.div
        className={cn("absolute rounded-full blur-3xl", styles.bottomOrbClassName)}
        animate={
          reduceVisualMotion ? undefined : { x: [0, 16, 0], y: [0, -24, 0], scale: [1, 1.04, 1] }
        }
        transition={
          reduceVisualMotion
            ? undefined
            : { duration: 22, ease: "easeInOut", repeat: Infinity, delay: 0.8 }
        }
      />

      {showGrid ? (
        <div
          className="absolute inset-0 opacity-[0.32]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(79,140,255,0.14) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            maskImage:
              "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.04) 35%, transparent 75%)",
          }}
        />
      ) : null}

      <CalmParticles
        density="low"
        disabled={!showParticles || reduceVisualMotion}
        colors={["#FFFFFF", "#DCE9FF", "#C7F3E7"]}
        className="z-[1] opacity-45"
      />
    </div>
  );
}
