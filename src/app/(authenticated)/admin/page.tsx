import { NotAuthorized } from "@/components/auth/not-authorized";
import { AuthAccessError, requireUser } from "@/lib/auth/require-user";

export default async function AdminPage() {
  try {
    await requireUser({ roles: ["admin"], onUnauthorized: "throw" });
  } catch (error) {
    if (error instanceof AuthAccessError && error.code === "forbidden") {
      return <NotAuthorized message="This page is restricted to admin staff." />;
    }

    throw error;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin</h1>
      <p className="mt-2 text-sm text-slate-600">
        Admin-only district configuration tools will be added here.
      </p>
    </section>
  );
}
