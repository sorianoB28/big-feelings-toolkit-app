import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "success";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClassNames: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary-dark shadow-[0_10px_24px_-18px_rgba(79,140,255,0.36)]",
  outline:
    "border border-primary/20 bg-white/76 text-primary-dark shadow-[0_10px_24px_-18px_rgba(79,140,255,0.24)]",
  success: "bg-emerald-100 text-emerald-800 shadow-[0_10px_24px_-18px_rgba(16,185,129,0.28)]",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "gradient-border inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variantClassNames[variant],
        className
      )}
      {...props}
    />
  );
}
