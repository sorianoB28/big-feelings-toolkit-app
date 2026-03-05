import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ToolsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <GlassCard variant="soft" className="p-5 sm:p-8">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />

        <div className="mt-6 space-y-8">
          {Array.from({ length: 3 }).map((_, sectionIndex) => (
            <div key={sectionIndex}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-px flex-1" />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {Array.from({ length: 2 }).map((__, cardIndex) => (
                  <GlassCard key={cardIndex} variant="default" className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-56 max-w-full" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
