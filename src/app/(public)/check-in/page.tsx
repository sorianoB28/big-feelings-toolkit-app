import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { listProfilesForUser } from "@/db/queries/profiles";
import { authOptions } from "@/lib/auth/options";

export default async function GuidedCheckInEntryPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const availableProfiles = userId ? await listProfilesForUser(userId) : [];

  redirect(userId && availableProfiles.length > 0 ? "/check-in/profile" : "/check-in/zone");
}
