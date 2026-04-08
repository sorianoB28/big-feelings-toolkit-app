"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import {
  buttonPrimaryClass,
  inputBaseClass,
} from "@/components/ui/form-styles";
import { FlashToast } from "@/components/ui/flash-toast";
import { MotionButton } from "@/components/ui/motion-primitives";
import { normalizeAuthNavigationUrl } from "@/lib/auth/client-navigation";
import { getSignInErrorMessage } from "@/lib/auth/sign-in-errors";

type SignInFormProps = {
  callbackUrl: string;
  initialError?: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function SignInForm({
  callbackUrl,
  initialError,
  disabled = false,
  disabledReason,
}: SignInFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(initialError ?? "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (disabled) {
      setError(disabledReason ?? "Sign-in is temporarily unavailable. Please try again later.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError(getSignInErrorMessage(result.error) ?? "Sign-in failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      if (!result?.ok || !result.url) {
        setError("Sign-in is temporarily unavailable. Please try again.");
        setIsSubmitting(false);
        return;
      }

      window.location.assign(normalizeAuthNavigationUrl(result.url, callbackUrl));
    } catch {
      setError("Sign-in is temporarily unavailable. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <FlashToast message={error} tone="error" /> : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-dark">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={disabled || isSubmitting}
          className={inputBaseClass}
          placeholder="name@example.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-dark">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={disabled || isSubmitting}
          className={inputBaseClass}
          placeholder="Enter your password"
        />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <MotionButton
        type="submit"
        disabled={disabled || isSubmitting}
        className={`${buttonPrimaryClass} min-h-12 w-full`}
      >
        {disabled ? "Sign In Unavailable" : isSubmitting ? "Signing In..." : "Sign In"}
      </MotionButton>
    </form>
  );
}
