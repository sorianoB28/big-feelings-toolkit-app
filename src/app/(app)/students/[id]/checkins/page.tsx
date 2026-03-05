import Link from "next/link";
import { notFound } from "next/navigation";
import { StudentCheckinsList } from "@/components/checkins/student-checkins-list";
import { buttonPrimaryClass, buttonSecondaryClass, inputBaseClass } from "@/components/ui/form-styles";
import { listCheckinsForStudent } from "@/db/queries/checkins";
import { getAccessibleStudentById } from "@/db/queries/students";
import { CHECKIN_ZONES } from "@/lib/checkin-options";
import { requireUser } from "@/lib/auth/require-user";

type StudentCheckinsPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    zone?: string;
  };
};

function normalizeZone(zone: string | undefined): string | null {
  if (!zone) {
    return null;
  }

  const candidate = zone.trim().toLowerCase();
  if (!candidate) {
    return null;
  }

  return CHECKIN_ZONES.some((option) => option.id === candidate) ? candidate : null;
}

export default async function StudentCheckinsPage({
  params,
  searchParams,
}: StudentCheckinsPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    notFound();
  }

  const zoneFilter = normalizeZone(searchParams?.zone);
  const checkins = await listCheckinsForStudent({
    studentId: student.id,
    zone: zoneFilter,
  });

  return (
    <section className="app-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {student.displayName}: Check-ins
          </h1>
          <p className="mt-1 text-sm text-slate-600">All check-ins for this student.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/students/${student.id}/checkin/start`}
            className={buttonPrimaryClass}
          >
            Start Check-In
          </Link>
          <Link
            href={`/students/${student.id}`}
            className={buttonSecondaryClass}
          >
            Back to Student
          </Link>
        </div>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="zone" className="mb-1 block text-sm font-medium text-slate-700">
            Zone
          </label>
          <select
            id="zone"
            name="zone"
            defaultValue={zoneFilter ?? ""}
            className={inputBaseClass}
          >
            <option value="">All zones</option>
            {CHECKIN_ZONES.map((zoneOption) => (
              <option key={zoneOption.id} value={zoneOption.id}>
                {zoneOption.emoji} {zoneOption.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={buttonSecondaryClass}
        >
          Apply
        </button>
        <Link
          href={`/students/${student.id}/checkins`}
          className={buttonSecondaryClass}
        >
          Clear
        </Link>
      </form>

      <div className="mt-6">
        <StudentCheckinsList
          checkins={checkins}
          emptyMessage={
            zoneFilter
              ? "No check-ins found for the selected zone yet."
              : "No check-ins yet for this student."
          }
        />
      </div>
    </section>
  );
}

