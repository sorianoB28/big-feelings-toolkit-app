import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { listProfilesForUser } from "@/db/queries/profiles";
import { listSavedStrategiesForProfile } from "@/db/queries/profile-saved-strategies";
import { authOptions } from "@/lib/auth/options";
import { CHECKIN_STRATEGY_CARDS, CHECKIN_STRATEGY_CATEGORIES } from "@/lib/checkin";
import { ToolkitFooter } from "@/components/layout/toolkit-footer";
import { ToolkitTopNav } from "@/components/layout/toolkit-top-nav";
import { SavedStrategiesPage } from "@/components/strategies/saved-strategies-page";

type SavedStrategiesRouteProps = {
  searchParams?: {
    profileId?: string;
    profile_id?: string;
  };
};

const strategyCardByKey = new Map(CHECKIN_STRATEGY_CARDS.map((card) => [card.key, card]));
const strategyCategoryByKey = new Map(
  CHECKIN_STRATEGY_CATEGORIES.map((category) => [category.key, category])
);

export default async function SavedStrategiesRoute({ searchParams }: SavedStrategiesRouteProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  const requestedProfileId =
    typeof searchParams?.profileId === "string"
      ? searchParams.profileId
      : typeof searchParams?.profile_id === "string"
        ? searchParams.profile_id
        : "";

  const profiles = userId ? await listProfilesForUser(userId) : [];
  const selectedProfile =
    profiles.find((profile) => profile.id === requestedProfileId) ?? profiles[0] ?? null;

  if (!selectedProfile && requestedProfileId) {
    redirect("/strategies/saved");
  }

  const savedStrategies = selectedProfile
    ? (await listSavedStrategiesForProfile(selectedProfile.id)).flatMap((saved) => {
        const card = strategyCardByKey.get(saved.strategyKey);

        if (!card) {
          return [];
        }

        const category = strategyCategoryByKey.get(card.category);

        if (!category) {
          return [];
        }

        return [
          {
            id: saved.id,
            profileId: saved.profileId,
            strategyKey: saved.strategyKey,
            categoryKey: category.key,
            categoryLabel: category.label,
            createdAt: saved.createdAt,
            card: {
              key: card.key,
              title: card.title,
              description: card.description,
              whyItHelps: card.whyItHelps,
              imagePath: card.imagePath,
              alt: card.alt,
              imageStatus: card.imageStatus,
            },
          },
        ];
      })
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden gradient-bg">
      <div className="pointer-events-none absolute -left-24 top-14 h-72 w-72 rounded-full bg-primary/16 blur-3xl" />
      <div className="pointer-events-none absolute right-[-4rem] top-24 h-80 w-80 rounded-full bg-secondary/16 blur-3xl" />
      <div className="toolkit-drift pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-accent/18 blur-3xl" />

      <ToolkitTopNav
        viewer={{
          isAuthenticated: Boolean(userId),
        }}
      />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
        <SavedStrategiesPage
          isAuthenticated={Boolean(userId)}
          profiles={profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar,
            checkinCount: profile.checkinCount,
          }))}
          selectedProfileId={selectedProfile?.id ?? null}
          savedStrategies={savedStrategies}
        />
      </main>

      <ToolkitFooter />
    </div>
  );
}
