import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { CHECKIN_STRATEGY_CARDS, type CheckinStrategyCategoryKey, type CheckinStrategyKey } from "@/lib/checkin";
import { authOptions } from "@/lib/auth/options";
import { getOwnedProfile } from "@/db/queries/profiles";
import {
  removeSavedStrategyForProfile,
  saveStrategyForProfile,
} from "@/db/queries/profile-saved-strategies";

type SaveStrategyRequestBody = {
  profile_id?: unknown;
  strategy_key?: unknown;
  category?: unknown;
};

const strategyCategoryByKey = new Map<CheckinStrategyKey, CheckinStrategyCategoryKey>(
  CHECKIN_STRATEGY_CARDS.map((card) => [card.key, card.category])
);

function isStrategyKey(value: unknown): value is CheckinStrategyKey {
  return typeof value === "string" && strategyCategoryByKey.has(value as CheckinStrategyKey);
}

function isStrategyCategoryKey(value: unknown): value is CheckinStrategyCategoryKey {
  return typeof value === "string" && CHECKIN_STRATEGY_CARDS.some((card) => card.category === value);
}

async function getOwnedProfileFromBody(body: SaveStrategyRequestBody, userId: string) {
  const profileId = typeof body.profile_id === "string" ? body.profile_id.trim() : "";

  if (!profileId) {
    return {
      error: NextResponse.json({ error: "Profile is required." }, { status: 400 }),
      profile: null,
      profileId,
    };
  }

  const profile = await getOwnedProfile(userId, profileId);

  if (!profile) {
    return {
      error: NextResponse.json({ error: "Profile not found." }, { status: 404 }),
      profile: null,
      profileId,
    };
  }

  return {
    error: null,
    profile,
    profileId,
  };
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Sign in to save strategies." }, { status: 401 });
  }

  let body: SaveStrategyRequestBody;

  try {
    body = (await request.json()) as SaveStrategyRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ownedProfileResult = await getOwnedProfileFromBody(body, userId);

  if (ownedProfileResult.error) {
    return ownedProfileResult.error;
  }

  if (!isStrategyKey(body.strategy_key)) {
    return NextResponse.json({ error: "Choose a valid strategy." }, { status: 400 });
  }

  const expectedCategory = strategyCategoryByKey.get(body.strategy_key) ?? null;
  const providedCategory = isStrategyCategoryKey(body.category) ? body.category : null;

  if (providedCategory && expectedCategory && providedCategory !== expectedCategory) {
    return NextResponse.json({ error: "Strategy category did not match the selected strategy." }, { status: 400 });
  }

  try {
    const result = await saveStrategyForProfile({
      profileId: ownedProfileResult.profile.id,
      strategyKey: body.strategy_key,
      category: expectedCategory,
    });

    return NextResponse.json(
      {
        ok: true,
        saved: true,
        created: result.created,
        strategy: result.strategy,
      },
      { status: result.created ? 201 : 200 }
    );
  } catch {
    return NextResponse.json({ error: "Unable to save this strategy right now." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Sign in to manage saved strategies." }, { status: 401 });
  }

  let body: SaveStrategyRequestBody;

  try {
    body = (await request.json()) as SaveStrategyRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ownedProfileResult = await getOwnedProfileFromBody(body, userId);

  if (ownedProfileResult.error) {
    return ownedProfileResult.error;
  }

  if (!isStrategyKey(body.strategy_key)) {
    return NextResponse.json({ error: "Choose a valid strategy." }, { status: 400 });
  }

  try {
    const result = await removeSavedStrategyForProfile({
      profileId: ownedProfileResult.profile.id,
      strategyKey: body.strategy_key,
    });

    return NextResponse.json({
      ok: true,
      removed: result.removed,
    });
  } catch {
    return NextResponse.json({ error: "Unable to remove this strategy right now." }, { status: 500 });
  }
}
