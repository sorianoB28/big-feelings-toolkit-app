"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-200 hover:text-slate-900"
    >
      Sign out
    </button>
  );
}
