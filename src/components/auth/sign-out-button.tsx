"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { MotionButton } from "@/components/ui/motion-primitives";
import { normalizeAuthNavigationUrl } from "@/lib/auth/client-navigation";

type SignOutButtonProps = {
  className?: string;
  label?: string;
};

const defaultClassName =
  "w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-dark transition duration-[250ms] ease-out hover:bg-primary/10 hover:text-primary-dark";

export function SignOutButton({ className, label = "Sign out" }: SignOutButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <MotionButton
      type="button"
      onClick={async () => {
        setIsSubmitting(true);

        try {
          const result = await signOut({
            callbackUrl: window.location.origin + "/auth",
            redirect: false,
          });

          window.location.assign(normalizeAuthNavigationUrl(result?.url, "/auth"));
        } finally {
          setIsSubmitting(false);
        }
      }}
      disabled={isSubmitting}
      className={className ?? defaultClassName}
    >
      {label}
    </MotionButton>
  );
}
