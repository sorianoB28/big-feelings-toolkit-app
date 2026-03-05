import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentsLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <GlassCard variant="soft" className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-11 w-32 rounded-lg" />
        </div>

        <div className="mt-6">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        <GlassCard variant="solid" className="mt-6 overflow-hidden">
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-4 gap-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-24" />
              </div>
            ))}
          </div>
        </GlassCard>
      </GlassCard>
    </section>
  );
}
