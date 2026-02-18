import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccessibleStudentById } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";

type StudentDetailsPageProps = {
  params: {
    id: string;
  };
};

export default async function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    notFound();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {student.displayName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">Student profile details</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/students/${student.id}/edit`}
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Edit
          </Link>
          <Link
            href="/students"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back
          </Link>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Grade</dt>
          <dd className="mt-1 text-sm text-slate-900">{student.grade ?? "-"}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Homeroom</dt>
          <dd className="mt-1 text-sm text-slate-900">{student.homeroomClassroomName ?? "-"}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</dt>
          <dd className="mt-1 text-sm text-slate-900">{student.active ? "Active" : "Inactive"}</dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Staff Notes
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">
            {student.notes ?? "-"}
          </dd>
        </div>
      </dl>
    </section>
  );
}
