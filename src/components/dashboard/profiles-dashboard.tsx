"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import {
  toolkitButtonGhostClass,
  toolkitButtonPrimaryClass,
  toolkitButtonSecondaryClass,
} from "@/components/ui/form-styles";
import { ProfileAvatar } from "@/components/profiles/profile-avatar";
import { AVATARS } from "@/lib/student-options";
import type { AccountProfileSummary } from "@/db/queries/profiles";
import { cn } from "@/lib/utils";

type ProfilesDashboardProps = {
  displayName: string;
  initialProfiles: AccountProfileSummary[];
};

type AddProfileModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { name: string; avatarKey: string | null }) => Promise<void>;
};

const profileCardDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

function AddProfileModal({ open, onClose, onCreate }: AddProfileModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [avatarKey, setAvatarKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    setName("");
    setAvatarKey(null);
    setError("");
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Enter a profile name.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreate({ name: name.trim(), avatarKey });
      setIsSubmitting(false);
      handleClose();
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "We couldn't create that profile right now."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/28 px-4 py-8 backdrop-blur-sm"
        >
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8, scale: 0.98 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-2xl"
          >
            <GlassCard
              variant="default"
              accent
              className="rounded-[2rem] border-white/45 bg-white/72 p-6 supports-[backdrop-filter]:bg-white/62 supports-[backdrop-filter]:backdrop-blur-2xl sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/68">
                    Add Profile
                  </p>
                  <h2 className="mt-3 text-[1.8rem] tracking-[-0.04em] text-dark">Create a new profile</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                    Add a child, student, or group profile to keep future check-ins tied to the
                    right account.
                  </p>
                </div>
                <button type="button" onClick={handleClose} className={toolkitButtonGhostClass}>
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label htmlFor="profile-name" className="mb-2 block text-sm font-semibold text-dark">
                    Profile Name
                  </label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Enter a child, student, or group name"
                    disabled={isSubmitting}
                    className="min-h-12 rounded-[1.2rem] bg-white/78"
                  />
                  {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold text-dark">Avatar (Optional)</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    <button
                      type="button"
                      onClick={() => setAvatarKey(null)}
                      disabled={isSubmitting}
                      aria-pressed={avatarKey === null}
                      className={cn(
                        "toolkit-focus-ring rounded-[1.35rem] border px-3 py-3 text-sm font-medium transition duration-[220ms] ease-out disabled:cursor-not-allowed disabled:opacity-70",
                        avatarKey === null
                          ? "border-primary bg-primary/10 text-primary-dark shadow-[0_20px_38px_-28px_rgba(79,140,255,0.34)]"
                          : "border-white/72 bg-white/82 text-dark hover:-translate-y-0.5 hover:bg-white"
                      )}
                    >
                      <div className="flex min-h-[5.5rem] flex-col items-center justify-center rounded-[1.05rem] border border-dashed border-white/75 bg-white/78">
                        <span className="text-sm font-semibold text-dark">No avatar</span>
                        <span className="mt-1 text-xs uppercase tracking-[0.14em] text-primary-dark/56">
                          Initials only
                        </span>
                      </div>
                    </button>
                    {AVATARS.map((avatar) => (
                      <button
                        key={avatar.key}
                        type="button"
                        onClick={() => setAvatarKey(avatar.key)}
                        disabled={isSubmitting}
                        aria-pressed={avatarKey === avatar.key}
                        className={cn(
                          "toolkit-focus-ring rounded-[1.35rem] border p-2.5 transition duration-[220ms] ease-out disabled:cursor-not-allowed disabled:opacity-70",
                          avatarKey === avatar.key
                            ? "border-primary bg-primary/10 shadow-[0_20px_38px_-28px_rgba(79,140,255,0.34)]"
                            : "border-white/72 bg-white/82 hover:-translate-y-0.5 hover:bg-white"
                        )}
                      >
                        <div className="relative">
                          <ProfileAvatar
                            avatarKey={avatar.key}
                            name={avatar.label}
                            size="md"
                            className="mx-auto"
                            imageClassName="object-contain p-1.5"
                          />
                          {avatarKey === avatar.key ? (
                            <span className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-dark text-white shadow-[0_12px_24px_-14px_rgba(33,77,147,0.42)]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-center text-xs font-semibold text-dark">{avatar.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(toolkitButtonPrimaryClass, "gap-2 disabled:opacity-75")}
                  >
                    {isSubmitting ? "Creating Profile..." : "Create Profile"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className={cn(toolkitButtonSecondaryClass, "disabled:opacity-75")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function ProfilesDashboard({ displayName, initialProfiles }: ProfilesDashboardProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profiles, setProfiles] = useState(initialProfiles);
  const [createError, setCreateError] = useState("");

  const totalCheckins = useMemo(
    () => profiles.reduce((sum, profile) => sum + profile.checkinCount, 0),
    [profiles]
  );

  async function handleCreateProfile(input: { name: string; avatarKey: string | null }) {
    setCreateError("");

    const response = await fetch("/api/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: input.name,
        avatar: input.avatarKey,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { error?: string; profile?: AccountProfileSummary }
      | null;

    if (!response.ok || !payload?.profile) {
      const message = payload?.error ?? "We couldn't create that profile right now.";
      setCreateError(message);
      throw new Error(message);
    }

    setProfiles((current) => [payload.profile!, ...current]);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-6">
        <GlassCard variant="soft" accent className="overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge>Your Profiles</Badge>
              <h1 className="mt-4 text-[2.2rem] tracking-[-0.05em] text-dark sm:text-[2.7rem]">
                Your Profiles
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Welcome back, {displayName}. Choose a profile to view check-in activity, or add a
                new one to grow the account structure.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="rounded-[1.35rem] border border-white/72 bg-white/84 px-4 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-dark/62">
                  Total check-ins
                </p>
                <p className="mt-2 text-[1.55rem] font-semibold tracking-[-0.03em] text-dark">
                  {totalCheckins}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCreateError("");
                  setIsModalOpen(true);
                }}
                className={cn(toolkitButtonPrimaryClass, "gap-2 self-start")}
              >
                <Plus className="h-4 w-4" />
                Add Profile
              </button>
            </div>
          </div>
          {createError ? (
            <div className="mt-5 rounded-[1.2rem] border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm leading-6 text-rose-700">
              {createError}
            </div>
          ) : null}
        </GlassCard>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              whileHover={prefersReducedMotion ? undefined : { y: -3 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
              className="h-full"
            >
              <Link href={`/dashboard/profile/${profile.id}`} className="block h-full">
                <GlassCard
                  variant="default"
                  hover
                  className="h-full rounded-[2rem] border-white/40 bg-white/80 p-5 supports-[backdrop-filter]:bg-white/68"
                >
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <ProfileAvatar avatarKey={profile.avatar} name={profile.name} />
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-dark/66">
                            Profile
                          </p>
                          <h2 className="mt-2 truncate text-[1.4rem] tracking-[-0.03em] text-dark">
                            {profile.name}
                          </h2>
                          <p className="mt-1 text-sm text-slate-600">
                            Last active{" "}
                            {profile.lastCheckinAt
                              ? profileCardDateFormatter.format(new Date(profile.lastCheckinAt))
                              : "Not yet"}
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="mt-1 h-5 w-5 text-primary-dark" />
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
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
                          History
                        </p>
                        <p className="mt-2 text-sm font-semibold text-dark">
                          {profile.lastCheckinAt ? "Recent check-in saved" : "No history yet"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-white/68 pt-4">
                      <p className="text-sm font-medium text-slate-600">
                        Open profile
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>

        {profiles.length === 0 ? (
          <GlassCard variant="soft" className="rounded-[2rem] p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/10 text-primary-dark">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-dark">No profiles yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
              Add a child, student, or group profile to begin the new account-to-profile dashboard flow.
            </p>
          </GlassCard>
        ) : null}
      </div>

      <AddProfileModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProfile}
      />
    </>
  );
}
