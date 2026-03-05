"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandHeader } from "@/components/brand/brand-header";
import { navIcons } from "@/lib/icons";
import type { AppRole } from "@/types/auth";

type NavLink = {
  href: string;
  label: string;
};

type AuthenticatedShellProps = {
  user: {
    name: string | null;
    email: string;
    role: AppRole;
  };
  links: NavLink[];
  children: React.ReactNode;
};

function getNavIconKey(href: string): keyof typeof navIcons {
  if (href.startsWith("/admin/staff")) return "staff";
  if (href.startsWith("/students")) return "students";
  if (href.startsWith("/resources")) return "resources";
  if (href.startsWith("/tools")) return "tools";
  if (href.startsWith("/profile")) return "profile";
  return "dashboard";
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith("/admin/staff")) return "Staff";
  if (pathname.startsWith("/students")) return "Students";
  if (pathname.startsWith("/resources")) return "Resources";
  if (pathname.startsWith("/tools")) return "Tools";
  if (pathname.startsWith("/profile")) return "Profile";
  if (pathname.startsWith("/checkins")) return "Check-ins";
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  return "Big Feelings Toolkit";
}

function getAvatarLabel(name: string | null, email: string): string {
  const source = (name?.trim() || email).toUpperCase();
  const parts = source.split(/\s+/).filter((value) => value.length > 0);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`;
  }

  return source.slice(0, 2);
}

export function AuthenticatedShell({ user, links, children }: AuthenticatedShellProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const avatarLabel = getAvatarLabel(user.name, user.email);

  return (
    <div className="flex min-h-0 flex-1 bg-background">
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
        <div className="flex h-full flex-col px-4 py-5">
          <div className="border-b border-border-soft/80 pb-4">
            <BrandHeader variant="sidebar" />
          </div>

          <nav className="mt-3 flex-1 space-y-1">
            {links.map((link) => {
              const active = isActivePath(pathname, link.href);
              const Icon = navIcons[getNavIconKey(link.href)];

              return (
                <motion.div
                  key={link.href}
                  whileHover={{ x: active ? 0 : 2 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <Link
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition duration-[250ms] ease-out ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-dark hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors duration-[250ms] ${
                        active ? "text-white" : "text-dark group-hover:text-primary"
                      }`}
                    />
                    <span>{link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-[60px] items-center justify-between border-b border-gray-200 bg-white px-6">
          <h1 className="text-lg font-semibold text-dark">{pageTitle}</h1>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary-dark">
              {avatarLabel}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-dark">{user.name ?? user.email}</p>
            </div>
            <SignOutButton
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-dark shadow-sm hover:bg-gray-100"
              label="Sign Out"
            />
          </div>
        </header>

        <main className="app-page px-6">
          <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
