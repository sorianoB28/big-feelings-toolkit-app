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
    <section className="app-card p-6 sm:p-8">
      <h1 className="tracking-tight">Admin</h1>
      <p className="mt-2 text-sm text-gray-700">
        Admin-only district configuration tools will be added here.
      </p>
    </section>
  );
}
