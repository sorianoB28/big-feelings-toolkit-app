import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "outline" | "success";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClassNames: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary-dark",
  outline: "border border-primary/25 bg-white/70 text-primary-dark",
  success: "bg-emerald-100 text-emerald-800",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variantClassNames[variant],
        className
      )}
      {...props}
    />
  );
}
