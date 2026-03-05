import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckinJourney } from "@/components/checkin/checkin-journey";
import { getActiveCheckinForStudent } from "@/db/queries/checkins";
import { getAccessibleStudentById } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";
import { saveStudentCheckinAction } from "./actions";

type StartCheckinPageProps = {
  params: {
    id: string;
  };
};

export default async function StartCheckinPage({ params }: StartCheckinPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    notFound();
  }
  const activeCheckin = await getActiveCheckinForStudent({ studentId: student.id });

  const startedAtIso = new Date().toISOString();
  const action = saveStudentCheckinAction.bind(null, student.id, startedAtIso);

  return (
    <section className="space-y-4">
      {activeCheckin ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">
            This student already has an active check-in. Resume?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/students/${student.id}/checkin/tools?checkinId=${activeCheckin.id}`}
              className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
            >
              Resume Check-In
            </Link>
          </div>
        </div>
      ) : null}

      <CheckinJourney
        studentId={student.id}
        studentName={student.displayName}
        studentThemeKey={student.themeKey}
        action={action}
      />
    </section>
  );
}
