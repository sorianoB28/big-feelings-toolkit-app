"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import {
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";
import { useGuidedCheckIn } from "./check-in-provider";

export function ProfileSelectionStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const { viewer, state, setProfile } = useGuidedCheckIn();
  const requestedProfileId = searchParams.get("profileId");

  useEffect(() => {
    if (!requestedProfileId || state.profileId === requestedProfileId) {
      return;
    }

    const matchingProfile = viewer.availableProfiles.find((profile) => profile.id === requestedProfileId);

    if (!matchingProfile) {
      return;
    }

    setProfile(matchingProfile.id, matchingProfile.name);
    router.replace("/check-in/zone");
  }, [requestedProfileId, router, setProfile, state.profileId, viewer.availableProfiles]);

  if (!viewer.isAuthenticated) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Profile</Badge>
          <h2 className="mt-4">You can start the check-in right away.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Signed-out check-ins stay public and unsaved. If you want to attach a completed session to
            a saved profile later, sign in first and start again from this step.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/check-in/zone" className={toolkitButtonPrimaryClass}>
              Continue to Zones
            </Link>
            <Link href="/auth" className={toolkitButtonSecondaryClass}>
              Sign In
            </Link>
          </div>
        </section>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Save rules
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            This flow never stores typed text or reflections. Signed-out check-ins stay entirely
            unsaved.
          </p>
        </aside>
      </div>
    );
  }

  if (viewer.availableProfiles.length < 1) {
    return (
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Profile</Badge>
          <h2 className="mt-4">Create a profile to save safe check-in selections.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            You are signed in, but there are no profiles on this account yet. Add one from the
            dashboard if you want zone, feeling, and strategy selections saved after completion.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard" className={toolkitButtonPrimaryClass}>
              Go to Dashboard
            </Link>
            <Link href="/check-in/zone" className={toolkitButtonSecondaryClass}>
              Continue Without Saving
            </Link>
          </div>
        </section>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Safe data only
          </p>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Even when saving is enabled, only profile-linked selections are stored. Typed text and
            reflections stay out of the database.
          </p>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="toolkit-panel-strong px-6 py-6 sm:px-7 sm:py-7">
          <Badge>Before you begin</Badge>
          <h2 className="mt-4">Choose which profile this check-in is for.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Pick one profile first so the finished check-in can be attached to the right history.
            The saved session can include the details gathered during the check-in, including body clues,
            tool use, and the strategies you keep.
          </p>
        </div>

        <aside className="toolkit-panel px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
            Not saved
          </p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
            <p>Profile history is tied to one completed session at a time.</p>
            <p>If you change your mind later, you can start a fresh check-in for a different profile.</p>
          </div>
        </aside>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {viewer.availableProfiles.map((profile) => {
          const isSelected = state.profileId === profile.id;

          return (
            <motion.button
              key={profile.id}
              type="button"
              onClick={() => {
                setProfile(profile.id, profile.name);
                router.push("/check-in/zone");
              }}
              whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeOut" }}
              className={cn(
                "toolkit-focus-ring group rounded-[2rem] border border-white/78 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.95))] p-5 text-left shadow-[0_24px_48px_-36px_rgba(79,140,255,0.24)] transition duration-[240ms] ease-out hover:border-primary/18 hover:shadow-[0_30px_62px_-40px_rgba(79,140,255,0.3)]",
                isSelected && "border-primary/24 ring-2 ring-primary/14"
              )}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <ProfileAvatar avatarKey={profile.avatar} name={profile.name} size="lg" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/66">
                        Profile
                      </p>
                      <h3 className="mt-2 text-[1.4rem] tracking-[-0.03em] text-dark">
                        {profile.name}
                      </h3>
                    </div>
                  </div>

                  {isSelected ? (
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary-dark px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white shadow-[0_18px_34px_-20px_rgba(33,77,147,0.44)]">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[1.25rem] border border-white/74 bg-white/86 px-4 py-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/62">
                      Check-ins
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-dark">
                      {profile.checkinCount}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/74 bg-white/86 px-4 py-4 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-dark/62">
                      Save mode
                    </p>
                    <p className="mt-2 text-sm font-semibold text-dark">Selections only</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/68 pt-4">
                  <p className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                    <UserRound className="h-4 w-4" />
                    Use this profile for the next check-in
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-dark">
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform duration-[220ms] ease-out group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </section>
    </div>
  );
}
