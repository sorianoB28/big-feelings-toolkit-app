"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { type AppMode, useAppMode } from "@/lib/app-mode";

const modeOptions: Array<{
  label: string;
  value: AppMode;
}> = [
  { label: "Toolkit", value: "toolkit" },
  { label: "Demo", value: "demo" },
];

const modeTargetPaths: Record<AppMode, string> = {
  toolkit: "/toolkit",
  demo: "/dashboard",
};

type ModeToggleProps = {
  className?: string;
  showLabel?: boolean;
};

export function ModeToggle({ className, showLabel = false }: ModeToggleProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { mode, setAppMode } = useAppMode();
  const [isPending, startTransition] = useTransition();

  function handleModeChange(nextMode: AppMode) {
    const targetPath = modeTargetPaths[nextMode];

    if (nextMode === mode && pathname === targetPath) {
      return;
    }

    setAppMode(nextMode);

    startTransition(() => {
      router.push(targetPath);
    });
  }

  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      {showLabel ? (
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark">
          App Mode
        </span>
      ) : null}

      <div
        className="inline-flex items-center rounded-full border border-primary/20 bg-white/90 p-1 shadow-sm ring-1 ring-primary/5 backdrop-blur"
        role="group"
        aria-label="Switch app mode"
      >
        {modeOptions.map((option) => {
          const isActive = mode === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleModeChange(option.value)}
              disabled={isPending}
              aria-pressed={isActive}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition duration-[250ms] ease-out",
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-primary-dark hover:bg-primary/10",
                isPending && "cursor-wait opacity-70",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
