import Link from "next/link";
import { NotAuthorized } from "@/components/auth/not-authorized";
import { listStaffBySchool, getStaffScopeForUser } from "@/db/queries/staff";
import { AuthAccessError, requireUser } from "@/lib/auth/require-user";

type StaffPageProps = {
  searchParams?: {
    created?: string;
  };
};

export default async function AdminStaffPage({ searchParams }: StaffPageProps) {
  try {
    const admin = await requireUser({ roles: ["admin"], onUnauthorized: "throw" });
    const scope = await getStaffScopeForUser(admin.id);
    const staff = await listStaffBySchool(scope.schoolId);
    const showCreatedMessage = searchParams?.created === "1";

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Staff Management
            </h1>
            <p className="mt-1 text-sm text-slate-600">Manage staff accounts for your school.</p>
          </div>
          <Link
            href="/admin/staff/new"
            className="inline-flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            New Staff User
          </Link>
        </div>

        {showCreatedMessage ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Staff account created successfully.
          </p>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                    No staff users found for this school.
                  </td>
                </tr>
              ) : (
                staff.map((person) => (
                  <tr key={person.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-800">{person.name ?? "-"}</td>
                    <td className="px-4 py-3 text-slate-700">{person.email}</td>
                    <td className="px-4 py-3 text-slate-700">{person.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          person.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {person.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  } catch (error) {
    if (error instanceof AuthAccessError && error.code === "forbidden") {
      return <NotAuthorized message="Only admins can manage staff accounts." />;
    }

    throw error;
  }
}
