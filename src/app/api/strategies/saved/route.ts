import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { listSavedStrategiesForProfile } from "@/db/queries/profile-saved-strategies";
import { getOwnedProfile } from "@/db/queries/profiles";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Sign in to view saved strategies." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const profileId = searchParams.get("profile_id")?.trim() ?? "";

  if (!profileId) {
    return NextResponse.json({ error: "Profile is required." }, { status: 400 });
  }

  const ownedProfile = await getOwnedProfile(userId, profileId);

  if (!ownedProfile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  try {
    const strategies = await listSavedStrategiesForProfile(ownedProfile.id);

    return NextResponse.json({
      ok: true,
      profile_id: ownedProfile.id,
      strategies,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load saved strategies right now." }, { status: 500 });
  }
}
