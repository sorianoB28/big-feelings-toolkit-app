"use client";

import { memo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ToolkitImagePlaceholder } from "@/lib/toolkit-image-placeholders";
import { cn } from "@/lib/utils";

type ToolkitEditorialImageProps = {
  image: ToolkitImagePlaceholder;
  className?: string;
  sizes?: string;
  priority?: boolean;
  imageClassName?: string;
};

function ToolkitEditorialImageComponent({
  image,
  className,
  sizes = "(min-width: 1280px) 36rem, (min-width: 768px) 50vw, 100vw",
  priority = false,
  imageClassName,
}: ToolkitEditorialImageProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={cn(
        "group relative isolate min-h-[18rem] overflow-hidden rounded-[2.05rem] border border-white/74 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(241,246,255,0.9))] p-3 shadow-[0_32px_72px_-42px_rgba(15,23,42,0.22)] will-change-transform sm:p-4",
        className,
      )}
      initial={false}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(94,211,179,0.1),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/78" />
      <div className="relative h-full min-h-[inherit] overflow-hidden rounded-[1.7rem] shadow-[0_24px_48px_-28px_rgba(15,23,42,0.24)]">
        <motion.div
          className="absolute inset-0 will-change-transform"
          whileHover={
            prefersReducedMotion
              ? undefined
              : { scale: 1.025, x: 4, y: -4 }
          }
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.7, ease: "easeOut" }
          }
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            loading={priority ? undefined : "lazy"}
            sizes={sizes}
            className={cn(
              "object-cover transition duration-700 ease-out",
              imageClassName,
            )}
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02)_38%,rgba(15,23,42,0.14)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_42%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.06),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.14))]" />
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/50" />
      </div>
    </motion.div>
  );
}

ToolkitEditorialImageComponent.displayName = "ToolkitEditorialImage";

export const ToolkitEditorialImage = memo(ToolkitEditorialImageComponent);
