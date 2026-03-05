import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { StudentCheckinHistoryTimeline } from "@/components/checkins/student-checkin-history-timeline";
import { FlashToast } from "@/components/ui/flash-toast";
import { buttonPrimaryClass, buttonSecondaryClass } from "@/components/ui/form-styles";
import { getActiveCheckinForStudent, getStudentCheckinHistory } from "@/db/queries/checkins";
import { getAccessibleStudentById } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";
import { AVATARS, THEMES } from "@/lib/student-options";

type StudentDetailsPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    saved?: string;
    message?: string;
    created?: string;
    updated?: string;
  };
};

export default async function StudentDetailsPage({ params, searchParams }: StudentDetailsPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    notFound();
  }
  const [checkinHistory, activeCheckin] = await Promise.all([
    getStudentCheckinHistory(student.id),
    getActiveCheckinForStudent(student.id),
  ]);
  const avatar = AVATARS.find((item) => item.key === student.avatarKey) ?? null;
  const theme = THEMES.find((item) => item.key === student.themeKey) ?? null;
  const studentHomeQuery = new URLSearchParams({
    name: student.displayName,
    points: String(student.points),
    studentId: student.id,
  });
  if (student.avatarKey) {
    studentHomeQuery.set("avatar", student.avatarKey);
  }
  if (student.themeKey) {
    studentHomeQuery.set("theme", student.themeKey);
  }
  const studentHomeHref = `/student?${studentHomeQuery.toString()}`;

  return (
    <section className="app-card p-6 sm:p-8">
      {searchParams?.created === "1" ? <FlashToast message="Student created successfully." /> : null}
      {searchParams?.updated === "1" ? <FlashToast message="Student updated successfully." /> : null}
      {searchParams?.saved === "checkin" || searchParams?.message === "checkin-saved" ? (
        <FlashToast message="Check-in saved." />
      ) : null}
      {activeCheckin ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-amber-900">Active check-in in progress.</p>
            <Link
              href={`/students/${student.id}/checkin/tools?checkinId=${activeCheckin.id}`}
              className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
            >
              Resume
            </Link>
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {avatar ? (
            <div className="h-12 w-12 overflow-hidden rounded-full border border-gray-200 bg-gray-50 shadow-sm">
              <Image
                src={avatar.imageSrc}
                alt={avatar.label}
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-500 shadow-sm">
              {student.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
          <h1 className="tracking-tight">{student.displayName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-sm text-gray-700">Student profile details</p>
              {theme ? (
                <span className="rounded-full border border-border-soft bg-surface px-2 py-0.5 text-xs font-medium text-dark">
                  Theme: {theme.label}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/students/${student.id}/checkin/start`}
            className={buttonPrimaryClass}
          >
            Start Check-In
          </Link>
          <Link
            href={`/students/${student.id}/rewards`}
            className={buttonPrimaryClass}
          >
            Rewards
          </Link>
          <Link
            href={`/students/${student.id}/edit`}
            className={buttonPrimaryClass}
          >
            Edit
          </Link>
          <Link
            href={studentHomeHref}
            className={buttonSecondaryClass}
          >
            Student Home
          </Link>
          <Link
            href="/students"
            className={buttonSecondaryClass}
          >
            Back
          </Link>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-background p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Grade</dt>
          <dd className="mt-1 text-sm text-dark">{student.grade ?? "-"}</dd>
        </div>
        <div className="rounded-lg bg-background p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Homeroom</dt>
          <dd className="mt-1 text-sm text-dark">{student.homeroomClassroomName ?? "-"}</dd>
        </div>
        <div className="rounded-lg bg-background p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Status</dt>
          <dd className="mt-1 text-sm text-dark">{student.active ? "Active" : "Inactive"}</dd>
        </div>
        <div className="rounded-lg bg-background p-4 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Staff Notes
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-dark">
            {student.notes ?? "-"}
          </dd>
        </div>
      </dl>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-dark">Check-ins</h2>
          <Link
            href={`/students/${student.id}/checkins`}
            className="text-sm font-medium text-primary transition duration-[250ms] ease-out hover:text-primary-dark hover:underline"
          >
            View all
          </Link>
        </div>

        <StudentCheckinHistoryTimeline checkins={checkinHistory} />
      </div>
    </section>
  );
}

