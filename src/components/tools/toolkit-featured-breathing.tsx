"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CircleDot } from "lucide-react";
import { toolkitButtonPrimaryClass } from "@/components/ui/form-styles";

type ToolkitFeaturedBreathingProps = {
  href: string;
};

export function ToolkitFeaturedBreathing({ href }: ToolkitFeaturedBreathingProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border-soft bg-[radial-gradient(circle_at_top,rgba(79,140,255,0.16),transparent_55%),linear-gradient(180deg,#ffffff,#f2f7ff)] p-8 shadow-[0_20px_48px_-30px_rgba(79,140,255,0.28)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(94,211,179,0.12),transparent_38%)]" />
      <motion.div
        className="pointer-events-none absolute left-6 top-6 h-28 w-28 rounded-full bg-primary/10 blur-3xl"
        animate={prefersReducedMotion ? undefined : { x: [0, 14, 0], y: [0, -8, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 10, repeat: Infinity, ease: "easeInOut" }
        }
      />
      <motion.div
        className="pointer-events-none absolute bottom-6 right-8 h-32 w-32 rounded-full bg-primary/10 blur-3xl"
        animate={prefersReducedMotion ? undefined : { x: [0, -10, 0], y: [0, 10, 0] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.35 }
        }
      />

      <div className="relative flex min-h-[360px] flex-col items-center justify-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-dark">
          Featured Tool
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-dark">Circle Breathing</h2>
        <p className="mt-2 max-w-sm text-sm text-gray-700">
          Follow the circle as it grows and shrinks to settle your body and slow your breathing.
        </p>

        <div className="relative mt-10 flex h-64 w-64 items-center justify-center">
          <motion.div
            className="absolute h-60 w-60 rounded-full border border-primary/20"
            animate={prefersReducedMotion ? undefined : { scale: [0.96, 1.03, 0.96] }}
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 12, repeat: Infinity, ease: "easeInOut" }
            }
          />
          <motion.div
            className="absolute h-44 w-44 rounded-full border-2 border-primary/40"
            animate={prefersReducedMotion ? undefined : { scale: [0.72, 1.12, 1.12, 0.72] }}
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.33, 0.5, 1],
                  }
            }
          />
          <motion.div
            className="absolute h-32 w-32 rounded-full bg-[linear-gradient(135deg,rgba(79,140,255,0.92),rgba(124,108,255,0.84),rgba(94,211,179,0.74))] shadow-[0_18px_40px_rgba(79,140,255,0.24)]"
            animate={prefersReducedMotion ? undefined : { scale: [0.72, 1.12, 1.12, 0.72] }}
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.33, 0.5, 1],
                  }
            }
          />
          <div className="relative flex flex-col items-center justify-center text-white">
            <CircleDot className="h-7 w-7" />
            <span className="mt-2 text-base font-semibold">Breathe</span>
            <span className="mt-1 text-xs uppercase tracking-[0.18em] text-white/80">
              In 4 / Hold 2 / Out 6
            </span>
          </div>
        </div>

        <Link href={href} className={`${toolkitButtonPrimaryClass} mt-10`}>
          Open Circle Breathing
        </Link>
      </div>
    </div>
  );
}
