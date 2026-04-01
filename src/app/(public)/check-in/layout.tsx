import { CalmBackground } from "@/components/animations/calm-background";
import { GuidedCheckInProvider } from "@/components/checkin-flow/check-in-provider";
import { GuidedCheckInShell } from "@/components/checkin-flow/check-in-shell";
import { ToolkitFooter } from "@/components/layout/toolkit-footer";
import { ToolkitTopNav } from "@/components/layout/toolkit-top-nav";

export default function GuidedCheckInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">
      <CalmBackground showParticles />

      <div className="relative z-10 flex min-h-screen flex-col">
        <ToolkitTopNav />
        <main className="flex flex-1 flex-col pb-16 pt-6">
          <GuidedCheckInProvider>
            <GuidedCheckInShell>{children}</GuidedCheckInShell>
          </GuidedCheckInProvider>
        </main>
        <ToolkitFooter />
      </div>
    </div>
  );
}
