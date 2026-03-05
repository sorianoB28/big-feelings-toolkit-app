import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StaffLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl">
      <GlassCard variant="soft" className="p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-11 w-36 rounded-lg" />
        </div>

        <div className="mt-6 overflow-hidden rounded-xl border border-border-soft bg-white">
          <div className="space-y-3 p-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="grid grid-cols-5 items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
