import { CalmBackground } from "@/components/animations/calm-background";
import { GuidedCheckInProvider } from "@/components/checkin-flow/check-in-provider";
import { GuidedCheckInShell } from "@/components/checkin-flow/check-in-shell";
import { ToolkitFooter } from "@/components/layout/toolkit-footer";
import { ToolkitTopNav } from "@/components/layout/toolkit-top-nav";
import { getServerSession } from "next-auth";
import { listProfilesForUser } from "@/db/queries/profiles";
import { authOptions } from "@/lib/auth/options";

export default async function GuidedCheckInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const availableProfiles = userId ? await listProfilesForUser(userId) : [];

  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">
      <CalmBackground showParticles />

      <div className="relative z-10 flex min-h-screen flex-col">
        <ToolkitTopNav
          viewer={{
            isAuthenticated: Boolean(userId),
          }}
        />
        <main className="flex flex-1 flex-col pb-16 pt-6">
          <GuidedCheckInProvider
            initialViewer={{
              userId,
              isAuthenticated: Boolean(userId),
              availableProfiles,
            }}
          >
            <GuidedCheckInShell>{children}</GuidedCheckInShell>
          </GuidedCheckInProvider>
        </main>
        <ToolkitFooter />
      </div>
    </div>
  );
}
