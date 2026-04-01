import Link from "next/link";
import { notFound } from "next/navigation";
import { toolkitButtonPrimaryClass, toolkitButtonSecondaryClass } from "@/components/ui/form-styles";
import {
  getGuidedCheckInStep,
  getNextGuidedCheckInStep,
  getPreviousGuidedCheckInStep,
} from "@/lib/checkin";

type GuidedCheckInStepPageProps = {
  params: {
    step: string;
  };
};

export default function GuidedCheckInStepPage({ params }: GuidedCheckInStepPageProps) {
  const step = getGuidedCheckInStep(params.step);

  if (!step) {
    notFound();
  }

  const previousStep = getPreviousGuidedCheckInStep(step.key);
  const nextStep = getNextGuidedCheckInStep(step.key);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/70">
          Route Foundation
        </p>
        <h2 className="mt-3">{step.label}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          The full {step.label.toLowerCase()} screen is intentionally not built yet. This shared
          route is now in place so later prompts can drop the real step UI into a stable, public
          Toolkit shell with preserved client-side state.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="toolkit-panel px-4 py-4">
            <p className="text-sm font-semibold text-dark">Current route</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.href}</p>
          </div>
          <div className="toolkit-panel px-4 py-4">
            <p className="text-sm font-semibold text-dark">Ready for next prompt</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Replace this placeholder with the real step interface when the detailed screen work
              begins.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          {previousStep ? (
            <Link href={previousStep.href} className={toolkitButtonSecondaryClass}>
              Back to {previousStep.label}
            </Link>
          ) : (
            <Link href="/toolkit" className={toolkitButtonSecondaryClass}>
              Back to Toolkit
            </Link>
          )}

          {nextStep ? (
            <Link href={nextStep.href} className={toolkitButtonPrimaryClass}>
              Preview {nextStep.label} Route
            </Link>
          ) : (
            <Link href="/tools" className={toolkitButtonPrimaryClass}>
              Open Toolkit Library
            </Link>
          )}
        </div>
      </section>

      <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
          Shared shell
        </p>
        <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
          <p>The step progress bar, back action, and privacy note all come from the nested layout.</p>
          <p>
            A client-side provider at the route-layout level holds selections for zone, feeling,
            body clues, reset tool, and strategy picks while users move between steps.
          </p>
          <p>
            No auth, database calls, or persistence have been added to this flow foundation.
          </p>
        </div>
      </aside>
    </div>
  );
}
