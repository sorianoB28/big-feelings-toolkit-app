"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
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
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
          Staff Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-cyan-500 placeholder:text-slate-400 focus:ring-2"
          placeholder="name@school.org"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-cyan-500 placeholder:text-slate-400 focus:ring-2"
          placeholder="Enter your password"
        />
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}
