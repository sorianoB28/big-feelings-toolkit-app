"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Engine } from "tsparticles-engine";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { cn } from "@/lib/utils";

const Particles = dynamic(
  async () => (await import("react-tsparticles")).default,
  { ssr: false }
);

type CalmParticlesDensity = "low" | "medium";

type CalmParticlesProps = {
  density?: CalmParticlesDensity;
  disabled?: boolean;
  className?: string;
};

const PARTICLE_COUNT: Record<CalmParticlesDensity, number> = {
  low: 10,
  medium: 18,
};

export function CalmParticles({
  density = "low",
  disabled = false,
  className,
}: CalmParticlesProps) {
  const { classroomSafeMode } = useClassroomSafeMode();
  const [engineReady, setEngineReady] = useState(false);

  const handleParticlesInit = useCallback(async (engine: Engine) => {
    const { loadFull } = await import("tsparticles");
    await loadFull(engine as never);
    setEngineReady(true);
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: PARTICLE_COUNT[density],
          density: {
            enable: true,
            area: 1100,
          },
        },
        color: {
          value: ["#862633", "#FFFFFF", "#D8D8D8"],
        },
        opacity: {
          value: { min: 0.03, max: 0.08 },
          animation: {
            enable: true,
            speed: 0.14,
            sync: false,
          },
        },
        size: {
          value: { min: 10, max: 24 },
        },
        move: {
          enable: true,
          speed: { min: 0.12, max: 0.32 },
          direction: "none",
          random: true,
          straight: false,
          outModes: {
            default: "out",
          },
        },
        links: {
          enable: false,
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false, mode: "none" },
          onClick: { enable: false, mode: "none" },
          resize: {
            delay: 0,
            enable: true,
          },
        },
      },
    }),
    [density]
  );

  if (disabled || classroomSafeMode) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <Particles
        id="calm-particles"
        init={handleParticlesInit}
        options={options as never}
        className={cn(
          "h-full w-full transition-opacity duration-500",
          engineReady ? "opacity-100" : "opacity-0"
        )}
      />
    </div>
  );
}
