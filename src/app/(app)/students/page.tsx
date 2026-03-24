import Link from "next/link";
import { ArrowRight, SearchX, Users } from "lucide-react";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/animations/page-transition";
import { listActiveCheckinsForStudents } from "@/db/queries/checkins";
import { listAccessibleStudents } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";

type StudentsPageProps = {
  searchParams?: {
    q?: string;
    startCheckin?: string;
  };
};

function getCheckinHref(studentId: string, activeCheckinId: string | null): string {
  if (activeCheckinId) {
    return `/students/${studentId}/checkin/tools?checkinId=${encodeURIComponent(activeCheckinId)}`;
  }

  return `/students/${studentId}/checkin/start`;
}

function getCheckinLabel(activeCheckinId: string | null): "Resume Check-In" | "Start Check-In" {
  return activeCheckinId ? "Resume Check-In" : "Start Check-In";
}

export default async function StudentsPage({ searchParams }: StudentsPageProps) {
  const user = await requireUser();
  const query = searchParams?.q?.trim() ?? "";
  const startCheckinMode = searchParams?.startCheckin === "1";
  const students = await listAccessibleStudents({
    actorUserId: user.id,
    search: query,
  });
  const activeCheckinsByStudent = await listActiveCheckinsForStudents(
    students.map((student) => student.id)
  );
  const hasQuery = query.length > 0;
  const hasNoStudents = students.length === 0 && !hasQuery;
  const hasNoSearchResults = students.length === 0 && hasQuery;

  return (
    <PageTransition>
      <GlassCard variant="soft" accent className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="tracking-tight">Students</h1>
            <p className="mt-1 text-sm text-gray-700">
              {startCheckinMode
                ? "Choose a student to start or resume a classroom check-in."
                : "Manage student emotional support profiles."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {startCheckinMode ? (
              <Link href="/students" className={buttonSecondaryClass}>
                Exit Quick Start
              </Link>
            ) : null}
            <Link href="/students/new" className={buttonPrimaryClass}>
              New Student
            </Link>
          </div>
        </div>

        {startCheckinMode ? (
          <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-dark">
                  Quick Start Check-In
                </p>
                <p className="mt-2 text-sm text-dark">
                  Search the roster, then use the action button beside a student to start or resume.
                </p>
              </div>
              <Badge variant="default" className="w-fit normal-case tracking-normal">
                Classroom flow
              </Badge>
            </div>
          </div>
        ) : null}

        <form className="mt-6">
          {startCheckinMode ? <input type="hidden" name="startCheckin" value="1" /> : null}
          <label htmlFor="q" className="sr-only">
            Search students
          </label>
          <Input
            id="q"
            name="q"
            type="search"
            defaultValue={query}
            autoFocus={startCheckinMode}
            placeholder={
              startCheckinMode ? "Search student to start a check-in" : "Search by name or grade"
            }
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
              description={
                startCheckinMode
                  ? "Try a different name or grade to quickly find the right student."
                  : "Try a different name or grade, or clear the search to view your full roster."
              }
              actionLabel="Clear Search"
              actionHref={startCheckinMode ? "/students?startCheckin=1" : "/students"}
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="grid gap-4 md:hidden">
              {students.map((student) => {
                const activeCheckin = activeCheckinsByStudent[student.id] ?? null;
                const checkinHref = getCheckinHref(student.id, activeCheckin?.id ?? null);
                const checkinLabel = getCheckinLabel(activeCheckin?.id ?? null);
                const checkinButtonClass =
                  activeCheckin || startCheckinMode ? buttonPrimaryClass : buttonSecondaryClass;

                return (
                  <GlassCard key={student.id} variant="solid" className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          href={`/students/${student.id}`}
                          className="text-base font-semibold text-primary hover:text-primary-dark hover:underline"
                        >
                          {student.displayName}
                        </Link>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge
                            variant={student.active ? "success" : "outline"}
                            className="normal-case tracking-normal"
                          >
                            {student.active ? "Active" : "Inactive"}
                          </Badge>
                          {activeCheckin ? (
                            <Badge variant="default" className="normal-case tracking-normal">
                              Check-in in progress
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      <Link
                        href={checkinHref}
                        className={`${checkinButtonClass} min-h-10 px-4`}
                      >
                        {checkinLabel}
                      </Link>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Grade
                        </dt>
                        <dd className="mt-1 text-dark">{student.grade ?? "-"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Homeroom
                        </dt>
                        <dd className="mt-1 text-dark">{student.homeroomClassroomName ?? "-"}</dd>
                      </div>
                    </dl>
                  </GlassCard>
                );
              })}
            </div>

            <GlassCard variant="solid" className="hidden overflow-hidden md:block">
              <table className="min-w-full divide-y divide-border-soft text-sm">
                <thead className="bg-background text-left text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Grade</th>
                    <th className="px-4 py-3 font-medium">Homeroom</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Check-In</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft bg-surface">
                  {students.map((student) => {
                    const activeCheckin = activeCheckinsByStudent[student.id] ?? null;
                    const checkinHref = getCheckinHref(student.id, activeCheckin?.id ?? null);
                    const checkinLabel = getCheckinLabel(activeCheckin?.id ?? null);
                    const checkinButtonClass = activeCheckin || startCheckinMode;

                    return (
                      <tr
                        key={student.id}
                        className="transition-all duration-[250ms] ease-out hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <Link
                                href={`/students/${student.id}`}
                                className="block font-medium text-primary hover:text-primary-dark hover:underline"
                              >
                                {student.displayName}
                              </Link>
                              {activeCheckin ? (
                                <p className="mt-1 text-xs font-medium text-primary-dark">
                                  Active check-in ready to resume
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{student.grade ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {student.homeroomClassroomName ?? "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge
                              variant={student.active ? "success" : "outline"}
                              className="normal-case tracking-normal"
                            >
                              {student.active ? "Active" : "Inactive"}
                            </Badge>
                            {activeCheckin ? (
                              <Badge variant="default" className="normal-case tracking-normal">
                                In progress
                              </Badge>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={checkinHref}
                            className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition duration-[250ms] ease-out ${
                              checkinButtonClass
                                ? "bg-primary text-white hover:bg-primary-dark"
                                : "border border-gray-300 bg-surface text-dark hover:bg-gray-100"
                            }`}
                          >
                            {checkinLabel}
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </GlassCard>
          </div>
        )}
      </GlassCard>
    </PageTransition>
  );
}
