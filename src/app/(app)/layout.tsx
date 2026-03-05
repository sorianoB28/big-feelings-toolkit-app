import { AuthenticatedShell } from "@/components/layout/authenticated-shell";
import { requireUser } from "@/lib/auth/require-user";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/students", label: "Students" },
  { href: "/resources", label: "Resources" },
  { href: "/tools", label: "Tools" },
];

export default async function AuthenticatedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  const links =
    user.role === "admin"
      ? [...sidebarLinks, { href: "/admin/staff", label: "Staff" }]
      : sidebarLinks;

  return <AuthenticatedShell user={user} links={links}>{children}</AuthenticatedShell>;
}
