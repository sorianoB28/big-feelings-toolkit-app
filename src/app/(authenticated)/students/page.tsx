import Link from "next/link";
import { listAccessibleStudents } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";

type StudentsPageProps = {
  searchParams?: {
    q?: string;
  };
};

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const user = await requireUser();
  const query = searchParams?.q?.trim() ?? "";
  const students = await listAccessibleStudents({
    actorUserId: user.id,
    search: query,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-600">
            Search and manage student profiles available to your staff role.
          </p>
        </div>
        <Link
          href="/students/new"
          className="inline-flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          New Student
        </Link>
      </div>

      <form className="mt-6">
        <label htmlFor="q" className="sr-only">
          Search students
        </label>
        <div className="flex gap-2">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by name or grade"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
          />
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Search
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Grade</th>
              <th className="px-4 py-3 font-medium">Homeroom</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {students.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  No students found.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/students/${student.id}`}
                      className="font-medium text-cyan-700 hover:underline"
                    >
                      {student.displayName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{student.grade ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {student.homeroomClassroomName ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        student.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {student.active ? "Active" : "Inactive"}
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
}
