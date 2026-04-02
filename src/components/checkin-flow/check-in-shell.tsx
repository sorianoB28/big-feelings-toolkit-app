"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { ToolkitPrivacyBanner } from "@/components/ui/toolkit-privacy-banner";
import { toolkitButtonGhostClass, toolkitButtonSecondaryClass } from "@/components/ui/form-styles";
import { GUIDED_CHECKIN_STEPS } from "@/lib/checkin";
import { cn } from "@/lib/utils";
import { useGuidedCheckIn } from "./check-in-provider";

type GuidedCheckInShellProps = {
  children: React.ReactNode;
};

function getStepKeyFromPathname(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1) ?? "";

  if (lastSegment === "complete") {
    return "more-strategies";
  }

  return lastSegment;
}

function ProfileIdentityPanel({
  profileName,
  avatarKey,
}: {
  profileName: string;
  avatarKey: string | null;
}) {
  return (
    <div className="inline-flex w-fit max-w-full items-center gap-3 self-start rounded-full border border-white/78 bg-white/88 px-3 py-2 shadow-[0_16px_32px_-28px_rgba(79,140,255,0.24)] backdrop-blur-md">
      <ProfileAvatar avatarKey={avatarKey} name={profileName} size="sm" />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold tracking-[-0.02em] text-dark">
          {profileName}
        </p>
      </div>
    </div>
  );
}

export function GuidedCheckInShell({ children }: GuidedCheckInShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const { hasHydrated, state, viewer } = useGuidedCheckIn();
  const currentPathStepKey = getStepKeyFromPathname(pathname);
  const hasSelectableProfiles = viewer.isAuthenticated && viewer.availableProfiles.length > 0;
  const isProfileStep = currentPathStepKey === "profile";
  const displaySteps = useMemo(() => {
    if (!hasSelectableProfiles) {
      return [...GUIDED_CHECKIN_STEPS];
    }

    return [
      {
        key: "profile",
        label: "Profile",
        shortLabel: "Profile",
        description: "Choose which saved profile this check-in belongs to before you begin.",
        href: "/check-in/profile",
      },
      ...GUIDED_CHECKIN_STEPS,
    ];
  }, [hasSelectableProfiles]);
  const currentStep =
    displaySteps.find((step) => step.key === currentPathStepKey) ??
    (isProfileStep ? displaySteps[0] : GUIDED_CHECKIN_STEPS[0]);
  const currentStepIndex = displaySteps.findIndex((step) => step.key === currentStep.key);
  const previousStep = displaySteps[currentStepIndex - 1] ?? null;
  const backHref = previousStep?.href ?? (viewer.isAuthenticated ? "/dashboard" : "/tools");
  const backLabel = previousStep
    ? `Back to ${previousStep.label}`
    : viewer.isAuthenticated
      ? "Back to Dashboard"
      : "Back to Toolkit";
  const progressPercent =
    displaySteps.length > 1 ? ((currentStepIndex + 1) / displaySteps.length) * 100 : 100;
  const privacyMessage =
    state.profileId && viewer.isAuthenticated
      ? `This check-in can save session details for ${state.profileName ?? "this profile"} when you finish.`
      : "This check-in can be used without saving.";
  const activeProfile =
    viewer.isAuthenticated && state.profileId
      ? viewer.availableProfiles.find((profile) => profile.id === state.profileId) ?? null
      : null;

  useEffect(() => {
    if (!hasHydrated || !hasSelectableProfiles || state.profileId || isProfileStep) {
      return;
    }

    router.replace("/check-in/profile");
  }, [hasHydrated, hasSelectableProfiles, isProfileStep, router, state.profileId]);

  return (
    <div className="app-container flex-1 pb-20 pt-3 sm:pt-8">
      <div className="toolkit-surface-level-1 relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(79,140,255,0.16),rgba(124,108,255,0.08),transparent)]" />
        <div className="pointer-events-none absolute left-0 top-0 h-36 w-36 rounded-full bg-white/60 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-8 h-44 w-44 rounded-full bg-secondary/12 blur-3xl" />

        <div className="relative space-y-6">
          <section className="border-b border-white/65 pb-6">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="max-w-3xl space-y-4">
              <Link href={backHref} className={cn(toolkitButtonGhostClass, "w-fit gap-2 px-4")}>
                <ChevronLeft className="h-4 w-4" />
                {backLabel}
              </Link>

                <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-dark/70">
                  Guided Check-In
                </p>
                <h1 className="text-[2.2rem] sm:text-[2.8rem]">Notice what you need next.</h1>
                <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Move through one calm step at a time. This public Toolkit check-in is built to
                  help you notice, reset, and choose a supportive next step. If you are signed in,
                  you can attach the completed session to a profile before you begin.
                </p>
                </div>

                <Link href="/tools" className={toolkitButtonSecondaryClass}>
                  Browse Toolkit Library
                </Link>

                <ToolkitPrivacyBanner
                  visible
                  message={privacyMessage}
                  className="w-full max-w-2xl bg-white/82"
                />
              </div>

              <div className="flex items-start lg:justify-end">
                {activeProfile ? (
                  <ProfileIdentityPanel
                    profileName={activeProfile.name}
                    avatarKey={activeProfile.avatar}
                  />
                ) : null}
              </div>
            </div>
          </section>

          <div className="toolkit-panel-strong overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/65 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                  Step {currentStepIndex + 1} of {displaySteps.length}
                </p>
                <p className="mt-2 text-base font-semibold text-dark">{currentStep.label}</p>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">{currentStep.description}</p>
            </div>

            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/70">
              <motion.div
                className="h-full rounded-full bg-[linear-gradient(90deg,#4F8CFF,#7C6CFF)]"
                initial={prefersReducedMotion ? false : { width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }}
              />
            </div>

            <ol
              className={cn(
                "mt-4 grid gap-3",
                displaySteps.length > 5 ? "md:grid-cols-3 xl:grid-cols-6" : "md:grid-cols-5"
              )}
              aria-label="Guided check-in progress"
            >
              {displaySteps.map((step, index) => {
                const isCurrent = step.key === currentStep.key;
                const isComplete = index < currentStepIndex;

                return (
                  <li key={step.key} className="list-none">
                    <div
                      className={cn(
                        "rounded-[1.5rem] border px-4 py-3 transition duration-[220ms] ease-out",
                        isCurrent
                          ? "border-primary/26 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,247,255,0.96))] shadow-[0_20px_48px_-32px_rgba(79,140,255,0.3)]"
                          : isComplete
                            ? "border-white/78 bg-white/90 shadow-[0_14px_34px_-28px_rgba(79,140,255,0.22)]"
                            : "border-white/62 bg-white/72"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            isCurrent
                              ? "bg-primary-dark text-white"
                              : isComplete
                                ? "bg-primary/14 text-primary-dark"
                                : "bg-white text-slate-500"
                          )}
                        >
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-dark">{step.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-primary-dark/58">
                            {step.shortLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              className="min-h-[26rem]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
