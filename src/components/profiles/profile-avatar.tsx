"use client";

import Image from "next/image";
import { AVATARS } from "@/lib/student-options";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  avatarKey: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageClassName?: string;
};

const sizeClassNameMap = {
  sm: "h-12 w-12 rounded-[1.1rem] text-sm",
  md: "h-14 w-14 rounded-[1.2rem] text-base",
  lg: "h-16 w-16 rounded-[1.4rem] text-lg",
  xl: "h-20 w-20 rounded-[1.6rem] text-xl",
} as const;

const sizesAttrMap = {
  sm: "48px",
  md: "56px",
  lg: "64px",
  xl: "80px",
} as const;

export function ProfileAvatar({
  avatarKey,
  name,
  size = "lg",
  className,
  imageClassName,
}: ProfileAvatarProps) {
  const avatar = AVATARS.find((item) => item.key === avatarKey) ?? null;
  const sizeClassName = sizeClassNameMap[size];

  if (avatar) {
    return (
      <div
        className={cn(
          "relative overflow-hidden border border-white/78 bg-white/92 shadow-[0_18px_40px_-28px_rgba(79,140,255,0.32)]",
          sizeClassName,
          className
        )}
      >
        <Image
          src={avatar.imageSrc}
          alt={avatar.label}
          fill
          sizes={sizesAttrMap[size]}
          className={cn("object-contain p-1", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center border border-white/78 bg-white/92 font-semibold text-primary-dark shadow-[0_18px_40px_-28px_rgba(79,140,255,0.32)]",
        sizeClassName,
        className
      )}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}
