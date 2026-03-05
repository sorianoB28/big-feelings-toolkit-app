import { Wrench } from "lucide-react";
import { ToolLibraryCard } from "@/components/tools/tool-library-card";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { toolCategoryIcons } from "@/lib/icons";
import { PageTransition } from "@/components/animations/page-transition";
import { getToolsGroupedByCategory } from "@/lib/tools/registry";

function getDurationLabel(durationSeconds: number): string {
  const minutes = Math.round(durationSeconds / 60);
  return `${minutes} min`;
}

export default function ToolsLibraryPage() {
  const groupedTools = getToolsGroupedByCategory();
  const hasAnyTools = groupedTools.some((group) => group.tools.length > 0);

  return (
    <PageTransition>
      <GlassCard variant="soft" accent className="p-5 sm:p-8">
        <h1 className="tracking-tight">Tools Library</h1>
        <p className="mt-2 text-sm text-gray-700">
          Choose a quick strategy to calm your body, release energy, reset your mind, or get support.
        </p>

        {hasAnyTools ? (
          <div className="mt-6 space-y-8">
            {groupedTools.map((group) => {
              const Icon = toolCategoryIcons[group.category];

              return (
                <div key={group.category}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gray-100 p-2 text-dark">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-dark">{group.label}</h2>
                    <div className="h-px flex-1 bg-primary/35" />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {group.tools.map((tool) => (
                      <ToolLibraryCard
                        key={tool.toolKey}
                        href={`/tools/${tool.toolKey}`}
                        toolKey={tool.toolKey}
                        title={tool.title}
                        description={tool.description}
                        durationLabel={getDurationLabel(tool.durationSeconds)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Wrench}
              title="Tools are getting prepared"
              description="No regulation tools are available right now. Check back soon or return to the dashboard."
              actionLabel="Back to Dashboard"
              actionHref="/dashboard"
            />
          </div>
        )}
      </GlassCard>
    </PageTransition>
  );
}
