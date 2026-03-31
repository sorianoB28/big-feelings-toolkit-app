import { CalmBackground } from "@/components/animations/calm-background";
import { ToolkitFooter } from "@/components/layout/toolkit-footer";
import { ToolkitTopNav } from "@/components/layout/toolkit-top-nav";

export default function ToolkitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">
      <CalmBackground showParticles />

      <div className="relative z-10 flex min-h-screen flex-col">
        <ToolkitTopNav />
        <main className="flex-1 pb-16 pt-6">{children}</main>
        <ToolkitFooter />
      </div>
    </div>
  );
}
