"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type CheckInImageFrameProps = {
  src: string;
  alt: string;
  sizes: string;
  aspectClassName?: string;
  className?: string;
  imageClassName?: string;
};

export function CheckInImageFrame({
  src,
  alt,
  sizes,
  aspectClassName = "aspect-[4/3]",
  className,
  imageClassName,
}: CheckInImageFrameProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.25rem] border border-white/75 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(241,246,255,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        aspectClassName,
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={cn("object-contain p-2 sm:p-3", imageClassName)}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(15,23,42,0.04))]" />
    </div>
  );
}
