import Link from "next/link";
import type { ClassroomOption, StudentDetail } from "@/db/queries/students";

type StudentFormDefaults = Pick<
  StudentDetail,
  "displayName" | "grade" | "homeroomClassroomId" | "notes" | "active"
>;

type StudentFormProps = {
  title: string;
  description: string;
  action: (formData: FormData) => void | Promise<void>;
  submitLabel: string;
  cancelHref: string;
  classrooms: ClassroomOption[];
  defaults?: StudentFormDefaults;
  errorMessage?: string;
};

const emptyDefaults: StudentFormDefaults = {
  displayName: "",
  grade: "",
  homeroomClassroomId: "",
  notes: "",
  active: true,
};

export function StudentForm({
  title,
  description,
  action,
  submitLabel,
  cancelHref,
  classrooms,
  defaults = emptyDefaults,
  errorMessage,
}: StudentFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <form action={action} className="mt-6 space-y-5">
        <div>
          <label htmlFor="display_name" className="mb-1 block text-sm font-medium text-slate-700">
            Display Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            maxLength={120}
            defaultValue={defaults.displayName}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="grade" className="mb-1 block text-sm font-medium text-slate-700">
            Grade
          </label>
          <input
            id="grade"
            name="grade"
            type="text"
            maxLength={20}
            defaultValue={defaults.grade ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
            placeholder="e.g. 5th"
          />
        </div>

        <div>
          <label
            htmlFor="homeroom_classroom_id"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Homeroom Classroom (Optional)
          </label>
          <select
            id="homeroom_classroom_id"
            name="homeroom_classroom_id"
            defaultValue={defaults.homeroomClassroomId ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
          >
            <option value="">None</option>
            {classrooms.map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
            Staff Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            maxLength={2000}
            defaultValue={defaults.notes ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
            placeholder="Private notes visible to staff only"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults.active}
            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
          />
          Active student profile
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            {submitLabel}
          </button>
          <Link
            href={cancelHref}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
