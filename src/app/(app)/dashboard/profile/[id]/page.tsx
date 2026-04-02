import { notFound } from "next/navigation";
import { PageTransition } from "@/components/animations/page-transition";
import { ProfileDetailView } from "@/components/dashboard/profile-detail-view";
import { requireUser } from "@/lib/auth/require-user";
import { getProfileDetailForUser } from "@/db/queries/profiles";

type DashboardProfilePageProps = {
  params: {
    id: string;
  };
};

export default async function DashboardProfilePage({ params }: DashboardProfilePageProps) {
  const user = await requireUser();
  const profile = await getProfileDetailForUser(user.id, params.id);

  if (!profile) {
    notFound();
  }

  return (
    <PageTransition>
      <ProfileDetailView profile={profile} />
    </PageTransition>
  );
}
