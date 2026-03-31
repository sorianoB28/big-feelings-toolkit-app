"use client";

import { ShieldCheck } from "lucide-react";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { cn } from "@/lib/utils";

type ClassroomSafeToggleProps = {
  className?: string;
  variant?: "default" | "pill";
};

export function ClassroomSafeToggle({
  className,
  variant = "default",
}: ClassroomSafeToggleProps) {
  const { classroomSafeMode, toggleSafeMode } = useClassroomSafeMode();
  const isPill = variant === "pill";

  return (
    <button
      type="button"
      onClick={toggleSafeMode}
      title="Reduces effects and motion."
      aria-label={classroomSafeMode ? "Disable Classroom-Safe mode" : "Enable Classroom-Safe mode"}
      aria-pressed={classroomSafeMode}
      className={cn(
        isPill
          ? "toolkit-focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] transition duration-[250ms] ease-out"
          : "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition duration-[200ms] ease-out",
        classroomSafeMode
          ? isPill
            ? "border-primary/30 bg-primary/12 text-primary-dark shadow-[0_18px_32px_-24px_rgba(79,140,255,0.34)]"
            : "border-primary/35 bg-primary/10 text-primary-dark"
          : isPill
            ? "border-white/80 bg-white/84 text-dark shadow-[0_18px_32px_-26px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:border-primary/18 hover:bg-white"
            : "border-gray-300 bg-white text-dark hover:bg-gray-100",
        className
      )}
    >
      <ShieldCheck className="h-4 w-4" />
      Classroom-Safe
    </button>
  );
}
