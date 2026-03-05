import Link from "next/link";
import { SearchX, Users } from "lucide-react";
import { buttonPrimaryClass } from "@/components/ui/form-styles";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/animations/page-transition";
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
  const hasQuery = query.length > 0;
  const hasNoStudents = students.length === 0 && !hasQuery;
  const hasNoSearchResults = students.length === 0 && hasQuery;

  return (
    <PageTransition>
      <GlassCard variant="soft" accent className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="tracking-tight">Students</h1>
            <p className="mt-1 text-sm text-gray-700">Manage student emotional support profiles.</p>
          </div>
          <Link href="/students/new" className={buttonPrimaryClass}>
            New Student
          </Link>
        </div>

        <form className="mt-6">
          <label htmlFor="q" className="sr-only">
            Search students
          </label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by name or grade"
          />
        </form>

        {hasNoStudents ? (
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title="No student profiles yet"
              description="Create your first student profile to start check-ins, track patterns, and support regulation planning."
              actionLabel="Create Student"
              actionHref="/students/new"
            />
          </div>
        ) : hasNoSearchResults ? (
          <div className="mt-6">
            <EmptyState
              icon={SearchX}
              title="No matching students"
              description="Try a different name or grade, or clear the search to view your full roster."
              actionLabel="Clear Search"
              actionHref="/students"
            />
          </div>
        ) : (
          <GlassCard variant="solid" className="mt-6 overflow-hidden">
            <table className="min-w-full divide-y divide-border-soft text-sm">
              <thead className="bg-background text-left text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Homeroom</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft bg-surface">
                {students.map((student) => (
                  <tr
                    key={student.id}
                    className="cursor-pointer transition-all duration-[250ms] ease-out hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/students/${student.id}`}
                        className="block font-medium text-primary hover:text-primary-dark hover:underline"
                      >
                        {student.displayName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{student.grade ?? "-"}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {student.homeroomClassroomName ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={student.active ? "success" : "outline"} className="normal-case tracking-normal">
                        {student.active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        )}
      </GlassCard>
    </PageTransition>
  );
}

