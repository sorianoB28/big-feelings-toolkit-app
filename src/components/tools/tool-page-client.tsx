"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, type ComponentType } from "react";
import { CalmBackground } from "@/components/animations/calm-background";
import { ToolRunner } from "@/components/tools/tool-runner";
import { buttonSecondaryClass, toolkitButtonGhostClass } from "@/components/ui/form-styles";
import { useAppMode, type AppMode } from "@/lib/app-mode";
import { getToolByKey, type ToolRuntimeProps } from "@/lib/tools/registry";

type ToolPageClientProps = {
  toolKey: string;
  from?: string | null;
  zone?: string | null;
  intent?: string | null;
  backTo?: string | null;
  returnTo?: string | null;
  checkinId?: string | null;
  studentId?: string | null;
  themeKey?: string | null;
};

export function ToolPageClient({
  toolKey,
  from = null,
  zone = null,
  intent = null,
  backTo = null,
  returnTo = null,
  checkinId = null,
  studentId = null,
  themeKey = null,
}: ToolPageClientProps) {
  const { mode: appMode } = useAppMode();
  const tool = getToolByKey(toolKey);
  const isGuidedCheckinContext = from === "check-in";
  const runnerMode: AppMode =
    from === "checkin" ||
    from === "reset" ||
    Boolean(checkinId?.trim()) ||
    Boolean(studentId?.trim())
      ? "demo"
      : from === "toolkit" || isGuidedCheckinContext
        ? "toolkit"
        : appMode;

  const ToolComponent = useMemo(() => {
    if (!tool) {
      return null;
    }

    return dynamic(tool.loadComponent, {
      ssr: false,
      loading: () => (
        <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-6">
          <CalmBackground variant="immersive" className="z-0" />

          <div className="card-glass relative w-full max-w-xl rounded-[2.2rem] px-6 py-10 text-center shadow-glass sm:px-8">
            <div className="gradient-accent pointer-events-none absolute inset-0 opacity-60" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-dark/80">
                Preparing Tool
              </p>
              <h1 className="mt-4 text-3xl tracking-[-0.04em] text-dark">
                Loading your calm space
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Setting up the tool so you can jump straight in.
              </p>
            </div>
          </div>
        </div>
      ),
    }) as ComponentType<ToolRuntimeProps>;
  }, [tool]);

  if (!tool || !ToolComponent) {
    const missingToolButtonClass =
      runnerMode === "toolkit" ? toolkitButtonGhostClass : buttonSecondaryClass;

    return (
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-6">
        <CalmBackground variant="immersive" className="z-0" />

        <div className="card-glass relative w-full max-w-xl rounded-[2.2rem] px-6 py-10 text-center shadow-glass sm:px-8">
          <div className="gradient-accent pointer-events-none absolute inset-0 opacity-55" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary-dark/80">
              Tool Unavailable
            </p>
            <h1 className="mt-4 text-3xl tracking-[-0.04em] text-dark">Tool not found</h1>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              The tool you tried to open is unavailable right now.
            </p>
          </div>
          <Link href="/tools" className={`relative mt-6 ${missingToolButtonClass}`}>
            Back to Tools
          </Link>
        </div>
      </section>
    );
  }

  return (
    <ToolRunner
      toolKey={tool.toolKey}
      toolCategory={tool.category}
      toolLabel={tool.title}
      title={tool.title}
      description={tool.description}
      durationSeconds={tool.durationSeconds}
      hasProgress={tool.hasProgress}
      mode={runnerMode}
      ToolComponent={ToolComponent}
      from={from}
      zone={zone}
      intent={intent}
      backTo={backTo}
      returnTo={returnTo}
      checkinId={checkinId}
      studentId={studentId}
      themeKey={themeKey}
    />
  );
}
