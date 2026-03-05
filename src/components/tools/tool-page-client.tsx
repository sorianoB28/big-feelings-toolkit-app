"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo, type ComponentType } from "react";
import { ToolRunner } from "@/components/tools/tool-runner";
import { getToolByKey, type ToolRuntimeProps } from "@/lib/tools/registry";

type ToolPageClientProps = {
  toolKey: string;
  from?: string | null;
  zone?: string | null;
  checkinId?: string | null;
  studentId?: string | null;
  themeKey?: string | null;
};

export function ToolPageClient({
  toolKey,
  from = null,
  zone = null,
  checkinId = null,
  studentId = null,
  themeKey = null,
}: ToolPageClientProps) {
  const tool = getToolByKey(toolKey);

  const ToolComponent = useMemo(() => {
    if (!tool) {
      return null;
    }

    return dynamic(tool.loadComponent, {
      ssr: false,
      loading: () => (
        <div className="rounded-xl border border-border-soft bg-surface p-4 text-sm text-gray-700 shadow-sm">
          Loading tool...
        </div>
      ),
    }) as ComponentType<ToolRuntimeProps>;
  }, [tool]);

  if (!tool || !ToolComponent) {
    return (
      <section className="app-card p-6 sm:p-8">
        <h1 className="tracking-tight">Tool not found</h1>
        <p className="mt-2 text-sm text-gray-700">
          The tool you tried to open is unavailable.
        </p>
        <Link
          href="/tools"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-gray-300 bg-surface px-5 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
        >
          Back to Tools
        </Link>
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
      ToolComponent={ToolComponent}
      from={from}
      zone={zone}
      checkinId={checkinId}
      studentId={studentId}
      themeKey={themeKey}
    />
  );
}
