import Link from "next/link";
import { BrandHeader } from "@/components/brand/brand-header";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border-soft bg-surface/95 backdrop-blur">
        <nav className="app-container flex items-center justify-between py-3">
          <Link href="/" aria-label="Go to home page">
            <BrandHeader variant="compact" />
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
