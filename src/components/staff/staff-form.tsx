import Link from "next/link";
import type { AppRole } from "@/types/auth";

type StaffFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
  defaults?: {
    name?: string;
    email?: string;
    role?: AppRole;
  };
};

const roleOptions: Array<{ value: AppRole; label: string }> = [
  { value: "teacher", label: "Teacher" },
  { value: "sel_coach", label: "SEL Coach" },
  { value: "admin", label: "Admin" },
];

export function StaffForm({ action, errorMessage, defaults }: StaffFormProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create Staff Account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Create district staff login credentials for this school.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <form action={action} className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={defaults?.name ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            defaultValue={defaults?.email ?? ""}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
            placeholder="name@district.org"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={defaults?.role ?? "teacher"}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
          >
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="temporary_password"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Temporary Password
          </label>
          <input
            id="temporary_password"
            name="temporary_password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
            placeholder="Minimum 8 characters"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Create Staff User
          </button>
          <Link
            href="/admin/staff"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
