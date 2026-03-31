"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { toolkitButtonPrimaryClass } from "@/components/ui/form-styles";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/toolkit", label: "Home" },
  { href: "/tools", label: "Toolkit Library" },
] as const;

function isActiveLink(pathname: string, href: string): boolean {
  if (href === "/toolkit") {
    return pathname === "/toolkit";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ToolkitTopNav() {
  const pathname = usePathname();

  return (
    <header className="relative z-20 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="card-glass gradient-border highlight-sheen mx-auto w-full max-w-6xl rounded-[2rem] px-4 py-3 shadow-glass backdrop-blur-xl sm:px-5 sm:py-3.5">
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px gradient-accent opacity-90" />
        <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-primary/12 blur-3xl" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/toolkit"
            aria-label="Go to toolkit home page"
            className="toolkit-focus-ring flex min-w-0 items-center gap-3 rounded-[1.4rem] px-1 py-1"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/80 shadow-sm">
              <Image
                src="/images/toolkitlogo.png"
                alt="Big Feelings Toolkit"
                fill
                sizes="48px"
                className="object-contain p-1.5"
                priority
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-dark/80">
                Big Feelings
              </p>
              <p className="truncate text-sm font-semibold text-dark sm:text-base">Toolkit</p>
            </div>
          </Link>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <nav className="order-3 flex w-full flex-wrap items-center gap-2 sm:order-1 sm:w-auto">
              {navLinks.map((link) => {
                const active = isActiveLink(pathname, link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "toolkit-focus-ring inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-medium transition duration-[250ms] ease-out hover:-translate-y-0.5",
                      active
                        ? "border-primary/18 bg-primary/12 text-primary-dark shadow-[0_12px_28px_-20px_rgba(79,140,255,0.34)]"
                        : "border-transparent text-slate-700 hover:border-white/78 hover:bg-white/88 hover:text-primary-dark hover:shadow-[0_14px_28px_-22px_rgba(79,140,255,0.26)]",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="order-1 sm:order-2">
              <ModeToggle />
            </div>

            <Link href="/tools" className={cn(toolkitButtonPrimaryClass, "order-2 sm:order-3")}>
              Open Library
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
