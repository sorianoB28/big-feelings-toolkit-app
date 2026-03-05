"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandHeaderProps = {
  variant: "sidebar" | "auth" | "compact";
  showSchoolBadge?: boolean;
  className?: string;
};

type VariantConfig = {
  logoSize: number;
  titleClassName: string;
  subtitle?: string;
  subtitleClassName?: string;
  dividerWidthClassName: string;
};

const variantConfig: Record<BrandHeaderProps["variant"], VariantConfig> = {
  sidebar: {
    logoSize: 34,
    titleClassName: "text-base font-semibold tracking-tight text-dark",
    subtitle: "Teacher-led emotional regulation",
    subtitleClassName: "text-xs text-gray-600",
    dividerWidthClassName: "w-14",
  },
  auth: {
    logoSize: 40,
    titleClassName: "text-xl font-semibold tracking-tight text-dark",
    subtitle: "Oakestown Intermediate School",
    subtitleClassName: "text-sm text-gray-600",
    dividerWidthClassName: "w-16",
  },
  compact: {
    logoSize: 30,
    titleClassName: "text-base font-semibold tracking-tight text-dark",
    dividerWidthClassName: "w-12",
  },
};

export function BrandHeader({ variant, showSchoolBadge = false, className }: BrandHeaderProps) {
  const config = variantConfig[variant];

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Image
        src="/images/toolkitlogo.png"
        alt="Big Feelings Toolkit logo"
        width={config.logoSize}
        height={config.logoSize}
        className="h-auto w-auto shrink-0"
        priority={variant !== "sidebar"}
      />

      <div className="min-w-0">
        <p className={config.titleClassName}>Big Feelings Toolkit</p>
        <div className={cn("mt-1 h-0.5 rounded-full bg-primary/80", config.dividerWidthClassName)} />

        {config.subtitle ? (
          <div className="mt-1.5 flex items-center gap-2">
            <p className={cn("leading-snug", config.subtitleClassName)}>{config.subtitle}</p>
            {showSchoolBadge ? (
              <Image
                src="/images/school_logo.png"
                alt="Oakestown school logo"
                width={18}
                height={18}
                className="h-[18px] w-[18px] rounded-sm object-contain opacity-90"
              />
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
