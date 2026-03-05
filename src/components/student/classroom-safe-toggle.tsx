"use client";

import { ShieldCheck } from "lucide-react";
import { useClassroomSafeMode } from "@/hooks/useClassroomSafeMode";
import { cn } from "@/lib/utils";

type ClassroomSafeToggleProps = {
  className?: string;
};

export function ClassroomSafeToggle({ className }: ClassroomSafeToggleProps) {
  const { classroomSafeMode, toggleSafeMode } = useClassroomSafeMode();

  return (
    <button
      type="button"
      onClick={toggleSafeMode}
      title="Reduces effects and motion."
      aria-pressed={classroomSafeMode}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition duration-[200ms] ease-out",
        classroomSafeMode
          ? "border-primary/35 bg-primary/10 text-primary-dark"
          : "border-gray-300 bg-white text-dark hover:bg-gray-100",
        className
      )}
    >
      <ShieldCheck className="h-4 w-4" />
      Classroom-Safe
    </button>
  );
}

