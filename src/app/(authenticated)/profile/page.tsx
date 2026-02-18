import { getStaffProfileById } from "@/db/users";
import { requireUser } from "@/lib/auth/require-user";
import { changePasswordAction } from "./actions";

type ProfilePageProps = {
  searchParams?: {
    error?: string;
    updated?: string;
  };
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const user = await requireUser();
  const profile = await getStaffProfileById(user.id);

  if (!profile) {
    throw new Error("Profile not found.");
  }

  const showUpdatedMessage = searchParams?.updated === "1";
  const errorMessage = searchParams?.error;

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Your staff account details.</p>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Name</dt>
            <dd className="mt-1 text-sm text-slate-900">{profile.name ?? "-"}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
            <dd className="mt-1 text-sm text-slate-900">{profile.email}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</dt>
            <dd className="mt-1 text-sm text-slate-900">{profile.role}</dd>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">School</dt>
            <dd className="mt-1 text-sm text-slate-900">{profile.schoolName ?? "-"}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Change Password</h2>
        <p className="mt-2 text-sm text-slate-600">
          Update your account password. Use at least 8 characters.
        </p>

        {showUpdatedMessage ? (
          <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            Password updated successfully.
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {errorMessage}
          </p>
        ) : null}

        <form action={changePasswordAction} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="current_password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Current Password
            </label>
            <input
              id="current_password"
              name="current_password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
            />
          </div>

          <div>
            <label htmlFor="new_password" className="mb-1 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
            />
          </div>

          <div>
            <label
              htmlFor="confirm_new_password"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirm New Password
            </label>
            <input
              id="confirm_new_password"
              name="confirm_new_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-cyan-500 focus:ring-2"
            />
          </div>

          <button
            type="submit"
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
          >
            Update Password
          </button>
        </form>
      </div>
    </section>
  );
}
