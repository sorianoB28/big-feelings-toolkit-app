import { PageTransition } from "@/components/animations/page-transition";
import { ProfilesDashboard } from "@/components/dashboard/profiles-dashboard";
import { listProfilesForUser } from "@/db/queries/profiles";
import { requireUser } from "@/lib/auth/require-user";

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = user.name?.trim() || user.email;
  const profiles = await listProfilesForUser(user.id);

  return (
    <PageTransition>
      <ProfilesDashboard displayName={displayName} initialProfiles={profiles} />
    </PageTransition>
  );
}
