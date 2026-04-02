"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { signIn } from "next-auth/react";
import { BrandHeader } from "@/components/brand/brand-header";
import { GlassCard } from "@/components/ui/glass-card";
import {
  toolkitButtonGhostClass,
  toolkitButtonPrimaryClass,
} from "@/components/ui/form-styles";
import { getSignInErrorMessage } from "@/lib/auth/sign-in-errors";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "create";

type AuthExperienceProps = {
  callbackUrl: string;
  initialError?: string;
  disabled?: boolean;
  disabledReason?: string;
  initialMode?: AuthMode;
};

type FieldErrors = {
  email?: string;
  password?: string;
};

const authModeCopy: Record<
  AuthMode,
  {
    eyebrow: string;
    title: string;
    description: string;
    buttonLabel: string;
    toggleLabel: string;
  }
> = {
  signin: {
    eyebrow: "Welcome Back",
    title: "Sign in to your calm toolkit space",
    description: "Use your email and password to get back to your tools, profiles, and check-ins.",
    buttonLabel: "Sign In",
    toggleLabel: "Need an account? Create one",
  },
  create: {
    eyebrow: "Create Account",
    title: "Create your Big Feelings Toolkit account",
    description:
      "Set up a simple account to keep your family toolkit, profiles, and check-in flow in one place.",
    buttonLabel: "Create Account",
    toggleLabel: "Already have an account? Sign in",
  },
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm(mode: AuthMode, email: string, password: string): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (!email.trim()) {
    nextErrors.email = "Enter your email address.";
  } else if (!isValidEmail(email.trim())) {
    nextErrors.email = "Enter a valid email address.";
  }

  if (!password) {
    nextErrors.password = "Enter your password.";
  } else if (mode === "create" && password.length < 6) {
    nextErrors.password = "Use at least 6 characters.";
  }

  return nextErrors;
}

export function AuthExperience({
  callbackUrl,
  initialError,
  disabled = false,
  disabledReason,
  initialMode = "signin",
}: AuthExperienceProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<Partial<Record<keyof FieldErrors, boolean>>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState(initialError ?? "");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const content = authModeCopy[mode];

  const visibleErrors = useMemo(
    () => ({
      email: touched.email ? errors.email : undefined,
      password: touched.password ? errors.password : undefined,
    }),
    [errors.email, errors.password, touched.email, touched.password]
  );

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setSubmitError("");
    setSubmitSuccess("");
    setErrors({});
    setTouched({});
  }

  function handleBlur(field: keyof FieldErrors) {
    const nextTouched = { ...touched, [field]: true };
    setTouched(nextTouched);
    setErrors(validateForm(mode, email, password));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      setSubmitError(disabledReason ?? "Authentication is temporarily unavailable.");
      return;
    }

    const nextErrors = validateForm(mode, email, password);
    setTouched({ email: true, password: true });
    setErrors(nextErrors);
    setSubmitError("");
    setSubmitSuccess("");

    if (nextErrors.email || nextErrors.password) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "create") {
        const signupResponse = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        const signupPayload = (await signupResponse.json().catch(() => null)) as
          | { error?: string }
          | null;

        if (!signupResponse.ok) {
          setSubmitError(
            signupPayload?.error ??
              (signupResponse.status >= 500
                ? "We couldn't create your account right now."
                : "Check your details and try again.")
          );
          setIsSubmitting(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setSubmitSuccess("");
        setSubmitError(getSignInErrorMessage(result.error) ?? "Sign-in failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (!result?.ok || !result.url) {
        setSubmitSuccess("");
        setSubmitError("Sign-in is temporarily unavailable. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(mode === "create" ? "Account created. Redirecting..." : "Signing you in...");
      router.replace(result.url);
    } catch {
      setSubmitSuccess("");
      setSubmitError(
        mode === "create"
          ? "We couldn't reach the server. Check your connection and try again."
          : "We couldn't reach the server. Check your connection and try again."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eaf0ff_0%,#eef5ff_46%,#f7f8fc_100%)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.26),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,108,255,0.18),transparent_32%)]" />
      <div className="pointer-events-none absolute left-[-7rem] top-16 h-64 w-64 rounded-full bg-white/60 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-primary/16 blur-3xl" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <div className="relative min-h-[36vh] flex-1 overflow-hidden px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-8 lg:min-h-screen lg:px-10 lg:py-10">
          <div className="relative h-full overflow-hidden rounded-[2rem] border border-white/45 shadow-[0_36px_90px_-44px_rgba(15,23,42,0.38)] sm:rounded-[2.4rem]">
            <Image
              src="/images/signinpage.jpg"
              alt="A calm reflective support scene"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(22,36,73,0.76),rgba(79,140,255,0.32)_45%,rgba(124,108,255,0.22)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_bottom,rgba(15,23,42,0.24),transparent_50%)]" />

            <div className="relative flex h-full flex-col justify-between p-6 text-white sm:p-8 lg:p-10">
              <div className="rounded-full border border-white/28 bg-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/88 backdrop-blur-md">
                Big Feelings Toolkit
              </div>

              <div className="max-w-xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/72">
                  Calm, guided support
                </p>
                <h1 className="mt-4 text-[2.2rem] font-semibold tracking-[-0.05em] sm:text-[2.7rem] lg:text-[3.2rem]">
                  A softer way to begin.
                </h1>
                <p className="mt-5 max-w-lg text-sm leading-7 text-white/84 sm:text-base">
                  Start with a check-in, open a reset tool, and keep support close in one calming,
                  modern space built for real moments.
                </p>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  {[
                    "Guided check-ins",
                    "Breathing + reset tools",
                    "Profile-based support",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.35rem] border border-white/20 bg-white/12 px-4 py-4 text-sm font-medium text-white/88 backdrop-blur-md"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-5 pb-8 pt-0 sm:px-8 lg:max-w-[44rem] lg:px-8 lg:py-10">
          <GlassCard
            variant="default"
            accent
            className="w-full max-w-xl rounded-[2rem] border-white/45 bg-white/56 supports-[backdrop-filter]:bg-white/46 px-5 py-6 shadow-[0_38px_90px_-48px_rgba(15,23,42,0.4)] supports-[backdrop-filter]:backdrop-blur-2xl sm:px-7 sm:py-8"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between gap-4">
                <BrandHeader variant="compact" className="items-start" />
                <Link href="/toolkit" className={cn(toolkitButtonGhostClass, "px-4")}>
                  Back to Toolkit
                </Link>
              </div>

              <div className="rounded-[1.4rem] border border-white/55 bg-white/54 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                <div className="grid grid-cols-2 gap-1">
                  {(["signin", "create"] as const).map((value) => {
                    const isActive = mode === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => switchMode(value)}
                        className={cn(
                          "rounded-[1rem] px-4 py-3 text-sm font-semibold transition duration-[220ms] ease-out",
                          isActive
                            ? "bg-[linear-gradient(135deg,#4F8CFF,#7C6CFF)] text-white shadow-[0_18px_34px_-24px_rgba(79,140,255,0.52)]"
                            : "text-primary-dark/78 hover:bg-white/70"
                        )}
                      >
                        {value === "signin" ? "Sign In" : "Create Account"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={mode}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark/66">
                      {content.eyebrow}
                    </p>
                    <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-dark sm:text-[2.35rem]">
                      {content.title}
                    </h2>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                      {content.description}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="auth-email" className="mb-2 block text-sm font-semibold text-dark">
                        Email
                      </label>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-[1.25rem] border bg-white/72 px-4 py-3 shadow-sm transition duration-[220ms] ease-out focus-within:border-primary/35 focus-within:bg-white focus-within:shadow-[0_18px_36px_-24px_rgba(79,140,255,0.28)]",
                          visibleErrors.email ? "border-rose-300/70" : "border-white/70"
                        )}
                      >
                        <Mail className="h-4 w-4 text-primary-dark/60" />
                        <input
                          id="auth-email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (touched.email) {
                              setErrors(validateForm(mode, event.target.value, password));
                            }
                          }}
                          onBlur={() => handleBlur("email")}
                          disabled={disabled || isSubmitting}
                          placeholder="name@example.com"
                          className="w-full bg-transparent text-sm text-dark outline-none placeholder:text-slate-400"
                        />
                      </div>
                      {visibleErrors.email ? (
                        <p className="mt-2 text-sm text-rose-600">{visibleErrors.email}</p>
                      ) : null}
                    </div>

                    <div>
                      <label htmlFor="auth-password" className="mb-2 block text-sm font-semibold text-dark">
                        Password
                      </label>
                      <div
                        className={cn(
                          "flex items-center gap-3 rounded-[1.25rem] border bg-white/72 px-4 py-3 shadow-sm transition duration-[220ms] ease-out focus-within:border-primary/35 focus-within:bg-white focus-within:shadow-[0_18px_36px_-24px_rgba(79,140,255,0.28)]",
                          visibleErrors.password ? "border-rose-300/70" : "border-white/70"
                        )}
                      >
                        <LockKeyhole className="h-4 w-4 text-primary-dark/60" />
                        <input
                          id="auth-password"
                          type="password"
                          autoComplete={mode === "signin" ? "current-password" : "new-password"}
                          value={password}
                          onChange={(event) => {
                            setPassword(event.target.value);
                            if (touched.password) {
                              setErrors(validateForm(mode, email, event.target.value));
                            }
                          }}
                          onBlur={() => handleBlur("password")}
                          disabled={disabled || isSubmitting}
                          placeholder={mode === "signin" ? "Enter your password" : "Create a password"}
                          className="w-full bg-transparent text-sm text-dark outline-none placeholder:text-slate-400"
                        />
                      </div>
                      {visibleErrors.password ? (
                        <p className="mt-2 text-sm text-rose-600">{visibleErrors.password}</p>
                      ) : null}
                    </div>

                    {submitError ? (
                      <div className="rounded-[1.2rem] border border-rose-200/80 bg-rose-50/80 px-4 py-3 text-sm leading-6 text-rose-700">
                        {submitError}
                      </div>
                    ) : null}
                    {submitSuccess ? (
                      <div className="rounded-[1.2rem] border border-emerald-200/80 bg-emerald-50/80 px-4 py-3 text-sm leading-6 text-emerald-700">
                        {submitSuccess}
                      </div>
                    ) : null}

                    <motion.button
                      type="submit"
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                      disabled={disabled || isSubmitting}
                      className={cn(
                        toolkitButtonPrimaryClass,
                        "min-h-12 w-full gap-2 rounded-[1.2rem] bg-[linear-gradient(135deg,#4F8CFF,#7C6CFF)] shadow-[0_24px_48px_-28px_rgba(79,140,255,0.5)] hover:saturate-110"
                      )}
                    >
                      {disabled
                        ? "Authentication Unavailable"
                        : isSubmitting
                          ? mode === "signin"
                            ? "Signing In..."
                            : "Creating Account..."
                          : content.buttonLabel}
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </form>

                  <button
                    type="button"
                    onClick={() => switchMode(mode === "signin" ? "create" : "signin")}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-dark/78 transition duration-[220ms] ease-out hover:text-primary-dark"
                  >
                    <Sparkles className="h-4 w-4" />
                    {content.toggleLabel}
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}
