"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { cn } from "@/lib/utils";

type CalmParticlesDensity = "low" | "medium";

type CalmParticlesProps = {
  density?: CalmParticlesDensity;
  disabled?: boolean;
  className?: string;
  colors?: string[];
};

const PARTICLE_COUNT: Record<CalmParticlesDensity, number> = {
  low: 10,
  medium: 18,
};

type ParticleSpec = {
  id: string;
  leftPercent: number;
  topPercent: number;
  size: number;
  opacity: number;
  blur: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
  color: string;
};

function createParticleSpecs(
  density: CalmParticlesDensity,
  colors: string[]
): ParticleSpec[] {
  const particleCount = PARTICLE_COUNT[density];
  const palette = colors.length > 0 ? colors : ["#FFFFFF"];

  return Array.from({ length: particleCount }, (_, index) => {
    const sizeBase = density === "low" ? 14 : 12;
    const sizeVariance = density === "low" ? 12 : 16;
    const size = sizeBase + ((index * 7) % sizeVariance);
    const leftPercent = (12 + index * 17) % 100;
    const topPercent = (8 + index * 23) % 100;
    const opacity = 0.08 + (index % 4) * 0.02;
    const blur = 2 + (index % 3) * 1.5;
    const driftX = (index % 2 === 0 ? 1 : -1) * (10 + (index % 4) * 5);
    const driftY = (index % 3 === 0 ? -1 : 1) * (8 + (index % 5) * 4);
    const duration = 16 + (index % 5) * 3;
    const delay = (index % 4) * 1.2;

    return {
      id: `${density}-${index}`,
      leftPercent,
      topPercent,
      size,
      opacity,
      blur,
      driftX,
      driftY,
      duration,
      delay,
      color: palette[index % palette.length] ?? palette[0],
    };
  });
}

export function CalmParticles({
  density = "low",
  disabled = false,
  className,
  colors = ["#862633", "#FFFFFF", "#D8D8D8"],
}: CalmParticlesProps) {
  const prefersReducedMotion = useReducedMotion();
  const { classroomSafeMode } = useClassroomSafeMode();
  const particles = useMemo(() => createParticleSpecs(density, colors), [colors, density]);

  if (disabled || classroomSafeMode || particles.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full"
          initial={false}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, particle.driftX, 0],
                  y: [0, particle.driftY, 0],
                  scale: [1, 1.06, 1],
                  opacity: [particle.opacity, particle.opacity + 0.03, particle.opacity],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
          }
          style={{
            left: `calc(${particle.leftPercent}% - ${particle.size / 2}px)`,
            top: `calc(${particle.topPercent}% - ${particle.size / 2}px)`,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            filter: `blur(${particle.blur}px)`,
            background: `radial-gradient(circle at 32% 32%, rgba(255, 255, 255, 0.9), ${particle.color} 58%, rgba(255, 255, 255, 0) 100%)`,
            boxShadow: `0 0 18px ${particle.color}33`,
          }}
        />
      ))}
    </div>
  );
}
