import Link from "next/link";

export default function Home() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 items-center px-4 py-16 sm:py-24">
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          Big Feelings Toolkit App
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Big Feelings Toolkit
        </h1>
        <p className="mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
          A teacher-led emotional regulation system
        </p>
        <Link
          href="/auth/signin"
          className="mt-8 inline-flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
        >
          Sign In
        </Link>
      </div>
    </section>
  );
}
