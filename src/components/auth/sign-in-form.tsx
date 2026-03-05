"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import {
  buttonPrimaryClass,
  inputBaseClass,
} from "@/components/ui/form-styles";
import { FlashToast } from "@/components/ui/flash-toast";
import { MotionButton } from "@/components/ui/motion-primitives";
import { getSignInErrorMessage } from "@/lib/auth/sign-in-errors";

type SignInFormProps = {
  callbackUrl: string;
  initialError?: string;
};

export function SignInForm({ callbackUrl, initialError }: SignInFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(initialError ?? "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

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

    window.location.href = result?.url ?? callbackUrl;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <FlashToast message={error} tone="error" /> : null}
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-dark">
          Staff Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputBaseClass}
          placeholder="name@school.org"
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
          className={inputBaseClass}
          placeholder="Enter your password"
        />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <MotionButton type="submit" disabled={isSubmitting} className={`${buttonPrimaryClass} min-h-12 w-full`}>
        {isSubmitting ? "Signing In..." : "Sign In"}
      </MotionButton>
    </form>
  );
}
