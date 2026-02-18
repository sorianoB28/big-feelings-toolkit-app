import Link from "next/link";
import { requireUser } from "@/lib/auth/require-user";

const quickLinks = [
  { href: "/students", label: "Students" },
  { href: "/checkins", label: "Check-ins" },
  { href: "/resources", label: "Resources" },
];

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = user.name?.trim() || user.email;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
        Welcome, {displayName}
      </h1>
      <p className="mt-2 text-sm text-slate-600">Role: {user.role}</p>

      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick links
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
