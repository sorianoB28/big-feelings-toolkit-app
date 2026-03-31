"use client";

import { ShieldCheck } from "lucide-react";
import { useAppMode } from "@/lib/app-mode";
import { cn } from "@/lib/utils";

type ToolkitPrivacyBannerProps = {
  className?: string;
  visible?: boolean;
  variant?: "inline" | "footer";
};

export function ToolkitPrivacyBanner({
  className,
  visible,
  variant = "inline",
}: ToolkitPrivacyBannerProps) {
  const { isToolkitMode } = useAppMode();
  const shouldShow = visible ?? isToolkitMode;

  if (!shouldShow) {
    return null;
  }

  return (
    <div
      role="note"
      aria-label="Toolkit privacy notice"
      className={cn(
        variant === "footer"
          ? "flex w-fit items-center gap-2 rounded-full border border-white/70 bg-white/76 px-3 py-2 text-xs font-medium text-slate-600 shadow-[0_14px_28px_-24px_rgba(79,140,255,0.18)] backdrop-blur sm:px-4"
          : "flex w-fit items-center gap-2 rounded-full border border-white/75 bg-white/78 px-3 py-2 text-xs font-medium text-slate-600 shadow-[0_12px_28px_-24px_rgba(79,140,255,0.24)] backdrop-blur sm:px-4",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full",
          variant === "footer"
            ? "h-6 w-6 bg-white/80 text-slate-500 shadow-sm"
            : "h-7 w-7 bg-white/85 text-slate-600 shadow-sm",
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
      </span>
      <p className="leading-5">This toolkit does not save any personal data.</p>
    </div>
  );
}
