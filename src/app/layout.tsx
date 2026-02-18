import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Big Feelings Toolkit",
  description: "A teacher-led emotional regulation system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
            <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
              <Link href="/" className="text-base font-semibold tracking-tight text-slate-900">
                Big Feelings Toolkit
              </Link>
              <Link
                href="/auth/signin"
                className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Sign In
              </Link>
            </nav>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
