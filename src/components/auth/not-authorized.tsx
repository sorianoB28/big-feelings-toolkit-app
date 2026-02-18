import Link from "next/link";

type NotAuthorizedProps = {
  message?: string;
};

export function NotAuthorized({ message }: NotAuthorizedProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-amber-900">Not authorized</h1>
        <p className="mt-2 text-sm text-amber-800">
          {message ?? "You do not have permission to view this page."}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}
