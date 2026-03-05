"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { CheckinZoneId } from "@/lib/checkin-options";

type ZoneStepProps = {
  selectedZone: CheckinZoneId | null;
  onSelect: (zone: CheckinZoneId) => void;
  onAdvance: () => void;
  disabled?: boolean;
};

type ZoneCard = {
  id: CheckinZoneId;
  emoji: string;
  title: string;
  subtitle: string;
  bgClass: string;
  glowClass: string;
};

const ZONE_CARDS: ZoneCard[] = [
  {
    id: "green",
    emoji: "\u{1F7E2}",
    title: "Good to go",
    subtitle: "Steady and ready to learn.",
    bgClass: "from-emerald-50 to-emerald-100",
    glowClass: "bg-emerald-300/40",
  },
  {
    id: "yellow",
    emoji: "\u{1F7E1}",
    title: "Wiggly / distracted",
    subtitle: "A little buzzy or off track.",
    bgClass: "from-amber-50 to-amber-100",
    glowClass: "bg-amber-300/40",
  },
  {
    id: "blue",
    emoji: "\u{1F535}",
    title: "Low / tired / sad",
    subtitle: "Energy is low right now.",
    bgClass: "from-blue-50 to-blue-100",
    glowClass: "bg-blue-300/35",
  },
  {
    id: "red",
    emoji: "\u{1F534}",
    title: "Big feelings / overwhelmed",
    subtitle: "Feeling intense in this moment.",
    bgClass: "from-rose-50 to-rose-100",
    glowClass: "bg-rose-300/35",
  },
];

const SPARKLE_POINTS = [
  { x: -30, y: -16 },
  { x: 0, y: -22 },
  { x: 28, y: -14 },
  { x: -20, y: 18 },
  { x: 20, y: 20 },
];

const AUTO_ADVANCE_DELAY_MS = 260;

export function ZoneStep({ selectedZone, onSelect, onAdvance, disabled = false }: ZoneStepProps) {
  const reducedMotion = useReducedMotion();
  const [sparkleZone, setSparkleZone] = useState<CheckinZoneId | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const canAnimate = !reducedMotion;

  const sparkleAnimation = useMemo(
    () => ({
      initial: { opacity: 0, scale: 0.3, x: 0, y: 0 },
      animate: (point: { x: number; y: number }) => ({
        opacity: [0, 0.75, 0],
        scale: [0.3, 1, 0.4],
        x: [0, point.x],
        y: [0, point.y],
      }),
      transition: { duration: 0.4, ease: "easeOut" as const },
    }),
    []
  );

  function handleSelect(zoneId: CheckinZoneId) {
    if (disabled || isAdvancing) {
      return;
    }

    onSelect(zoneId);

    if (!canAnimate) {
      onAdvance();
      return;
    }

    setIsAdvancing(true);
    setSparkleZone(zoneId);

    window.setTimeout(() => {
      setSparkleZone(null);
      setIsAdvancing(false);
      onAdvance();
    }, AUTO_ADVANCE_DELAY_MS);
  }

  return (
    <div>
      <p className="text-2xl font-semibold tracking-tight text-dark">How&apos;s your engine right now?</p>
      <p className="mt-1 text-sm text-gray-700">Pick the zone that matches this moment.</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ZONE_CARDS.map((zoneCard) => {
          const isSelected = selectedZone === zoneCard.id;

          return (
            <motion.button
              key={zoneCard.id}
              type="button"
              onClick={() => handleSelect(zoneCard.id)}
              whileHover={canAnimate ? { y: -2 } : undefined}
              whileTap={canAnimate ? { scale: 0.99 } : undefined}
              disabled={disabled}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left shadow-sm transition duration-[250ms] ease-out ${
                isSelected
                  ? "border-primary bg-white"
                  : "border-border-soft bg-white hover:border-primary/35"
              }`}
            >
              <motion.div
                aria-hidden="true"
                className={`pointer-events-none absolute -inset-3 rounded-3xl blur-2xl ${zoneCard.glowClass}`}
                animate={
                  canAnimate
                    ? { opacity: [0.16, 0.3, 0.16], scale: [1, 1.04, 1] }
                    : { opacity: 0.18, scale: 1 }
                }
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />

              <div
                className={`relative rounded-xl bg-gradient-to-br p-4 ${zoneCard.bgClass} ${
                  isSelected ? "ring-1 ring-primary/25" : ""
                }`}
              >
                <p className="text-lg font-semibold text-dark">{zoneCard.emoji}</p>
                <p className="mt-2 text-base font-semibold text-dark">{zoneCard.title}</p>
                <p className="mt-1 text-sm text-gray-700">{zoneCard.subtitle}</p>
              </div>

              {canAnimate && sparkleZone === zoneCard.id ? (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  {SPARKLE_POINTS.map((point, index) => (
                    <motion.span
                      key={`${zoneCard.id}-${index}`}
                      custom={point}
                      initial={sparkleAnimation.initial}
                      animate={sparkleAnimation.animate(point)}
                      transition={sparkleAnimation.transition}
                      className="absolute h-1.5 w-1.5 rounded-full bg-primary/80"
                    />
                  ))}
                </div>
              ) : null}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
