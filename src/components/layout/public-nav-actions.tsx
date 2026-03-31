"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { cn } from "@/lib/utils";
import { useAppMode } from "@/lib/app-mode";

const TOOLKIT_NAV_LINKS = [
  { href: "/toolkit", label: "Toolkit" },
  { href: "/tools", label: "Tools" },
  { href: "/toolkit#about", label: "About" },
] as const;

export function PublicNavActions() {
  const pathname = usePathname();
  const { isDemoMode, isToolkitMode } = useAppMode();

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {isToolkitMode ? (
        <div className="flex flex-wrap items-center gap-2">
          {TOOLKIT_NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/toolkit"
                ? pathname === "/toolkit"
                : link.href === "/tools"
                  ? pathname === "/tools" || pathname.startsWith("/tools/")
                  : false;

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition duration-[250ms] ease-out",
                  isActive
                    ? "bg-primary/12 text-primary-dark shadow-sm"
                    : "text-slate-700 hover:bg-white/80 hover:text-primary-dark",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}

      <ModeToggle />

      {isDemoMode ? (
        <Link
          href="/auth/signin"
          className="inline-flex items-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
        >
          Sign In
        </Link>
      ) : null}
    </div>
  );
}
