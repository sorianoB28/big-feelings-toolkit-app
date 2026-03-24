import { Suspense } from "react";
import { ResetJourney } from "@/components/student/reset-journey";

function ResetJourneyFallback() {
  return (
    <section className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-background to-white">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-gray-500/10 blur-3xl" />

      <div className="app-container relative z-10 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border border-white/40 bg-white/75 p-6 shadow-md supports-[backdrop-filter]:backdrop-blur-md sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Reset Journey</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-dark">
            Let&apos;s find your next calm step
          </h1>
          <p className="mt-4 text-sm text-gray-700">Loading your reset options...</p>
        </div>
      </div>
    </section>
  );
}

export default function ResetJourneyPage() {
  return (
    <Suspense fallback={<ResetJourneyFallback />}>
      <ResetJourney />
    </Suspense>
  );
}
