import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireUser } from "@/lib/auth/require-user";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/students", label: "Students" },
  { href: "/resources", label: "Resources" },
];

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const links =
    user.role === "admin"
      ? [...sidebarLinks, { href: "/admin/staff", label: "Staff" }]
      : sidebarLinks;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row">
      <aside className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:w-64 md:self-start">
        <div className="border-b border-slate-200 pb-4">
          <p className="text-sm font-semibold text-slate-900">{user.name ?? user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{user.role}</p>
        </div>
        <nav className="mt-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-slate-200 pt-4">
          <SignOutButton />
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
