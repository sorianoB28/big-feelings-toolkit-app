"use client";

import { signOut } from "next-auth/react";
import { MotionButton } from "@/components/ui/motion-primitives";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

const defaultClassName =
  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-dark transition duration-[250ms] ease-out hover:bg-primary/10 hover:text-primary-dark";

export function SignOutButton({ className, label = "Sign out" }: SignOutButtonProps) {
  return (
    <MotionButton
      type="button"
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className={className ?? defaultClassName}
    >
      {label}
    </MotionButton>
  );
}
