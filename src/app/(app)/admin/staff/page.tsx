import Link from "next/link";
import { UserPlus2 } from "lucide-react";
import { NotAuthorized } from "@/components/auth/not-authorized";
import { FlashToast } from "@/components/ui/flash-toast";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonPrimaryClass } from "@/components/ui/form-styles";
import { PageTransition } from "@/components/animations/page-transition";
import { listStaffBySchool, getStaffScopeForUser } from "@/db/queries/staff";
import { AuthAccessError, requireUser } from "@/lib/auth/require-user";

type StaffPageProps = {
  searchParams?: {
    created?: string;
  };
};

function getAvatarLabel(name: string | null, email: string): string {
  const source = (name?.trim() || email).toUpperCase();
  const tokens = source.split(/\s+/).filter((token) => token.length > 0);

  if (tokens.length >= 2) {
    return `${tokens[0][0]}${tokens[1][0]}`;
  }

  return source.slice(0, 2);
}

function getRoleLabel(role: string): "Admin" | "Teacher" | "Staff" {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "teacher") {
    return "Teacher";
  }

  return "Staff";
}

function getRoleBadgeClass(roleLabel: "Admin" | "Teacher" | "Staff"): string {
  if (roleLabel === "Admin") {
    return "bg-primary/10 text-primary-dark";
  }

  if (roleLabel === "Teacher") {
    return "bg-sky-100 text-sky-800";
  }

  return "bg-gray-200 text-gray-700";
}

export default async function AdminStaffPage({ searchParams }: StaffPageProps) {
  try {
    const admin = await requireUser({ roles: ["admin"], onUnauthorized: "throw" });
    const scope = await getStaffScopeForUser(admin.id);
    const staff = await listStaffBySchool(scope.schoolId);
    const nonAdminStaffCount = staff.filter((person) => person.role !== "admin").length;
    const hasOnlyAdminUsers = nonAdminStaffCount === 0;
    const showCreatedMessage = searchParams?.created === "1";

    return (
      <PageTransition>
        <section className="app-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="tracking-tight">Staff Management</h1>
              <p className="mt-1 text-sm text-gray-700">Manage staff accounts.</p>
            </div>
            <Link href="/admin/staff/new" className={buttonPrimaryClass}>
              New Staff User
            </Link>
          </div>

          {showCreatedMessage ? <FlashToast message="Staff account created successfully." /> : null}

          {hasOnlyAdminUsers ? (
            <div className="mt-6">
              <EmptyState
                icon={UserPlus2}
                title="Add your first staff teammate"
                description="Invite teachers or support staff so they can run check-ins and tools with students."
                actionLabel="Create Staff User"
                actionHref="/admin/staff/new"
              />
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl border border-border-soft bg-surface shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-soft text-sm">
                  <thead className="bg-background text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Avatar</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-soft bg-surface">
                    {staff.map((person) => {
                      const roleLabel = getRoleLabel(person.role);
                      const avatarLabel = getAvatarLabel(person.name, person.email);

                      return (
                        <tr
                          key={person.id}
                          className="transition duration-[250ms] ease-out hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary-dark">
                              {avatarLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-dark">{person.name ?? "-"}</td>
                          <td className="px-4 py-3 text-gray-700">{person.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeClass(
                                roleLabel
                              )}`}
                            >
                              {roleLabel}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                person.isActive
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {person.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </PageTransition>
    );
  } catch (error) {
    if (error instanceof AuthAccessError && error.code === "forbidden") {
      return <NotAuthorized message="Only admins can manage staff accounts." />;
    }

    throw error;
  }
}

