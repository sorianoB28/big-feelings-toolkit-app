import Link from "next/link";
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputBaseClass,
} from "@/components/ui/form-styles";
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
    <section className="app-card p-6 sm:p-8">
      <h1 className="tracking-tight">Create Staff Account</h1>
      <p className="mt-2 text-sm text-gray-700">
        Create district staff login credentials for this school.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      <form action={action} className="mt-6 space-y-5">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-dark">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            maxLength={120}
            defaultValue={defaults?.name ?? ""}
            className={inputBaseClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-dark">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={254}
            defaultValue={defaults?.email ?? ""}
            className={inputBaseClass}
            placeholder="name@district.org"
          />
        </div>

        <div>
          <label htmlFor="role" className="mb-1 block text-sm font-medium text-dark">
            Role
          </label>
          <select
            id="role"
            name="role"
            defaultValue={defaults?.role ?? "teacher"}
            className={inputBaseClass}
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
            className="mb-1 block text-sm font-medium text-dark"
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
            className={inputBaseClass}
            placeholder="Minimum 8 characters"
          />
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" className={buttonPrimaryClass}>
            Create Staff User
          </button>
          <Link href="/admin/staff" className={buttonSecondaryClass}>
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
