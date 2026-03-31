import { PageTransition } from "@/components/ui/page-transition";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <PageTransition>{children}</PageTransition>
    </div>
  );
}
