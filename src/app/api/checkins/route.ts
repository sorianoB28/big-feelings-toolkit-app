import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import {
  buildGuidedCheckinBodyClues,
  buildGuidedCheckinStrategies,
  buildGuidedCheckinTools,
  createGuidedProfileCheckin,
} from "@/db/queries/guided-checkins";
import { getOwnedProfile } from "@/db/queries/profiles";
import type { CheckinStrategyKey, CheckinZoneKey } from "@/lib/checkin";

type CreateCheckinRequestBody = {
  profileId?: unknown;
  zoneKey?: unknown;
  feelingLabel?: unknown;
  intensity?: unknown;
  bodyClueKeys?: unknown;
  notes?: unknown;
  durationSeconds?: unknown;
  completed?: unknown;
  startedAt?: unknown;
  completedAt?: unknown;
  selectedToolKey?: unknown;
  selectedStrategyKeys?: unknown;
};

function isZoneKey(value: unknown): value is CheckinZoneKey {
  return value === "red" || value === "yellow" || value === "blue" || value === "green";
}

function isStrategyKeyList(value: unknown): value is CheckinStrategyKey[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isValidIntensity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 10;
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.trim().length < 1) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreateCheckinRequestBody;

  try {
    body = (await request.json()) as CreateCheckinRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const profileId = typeof body.profileId === "string" ? body.profileId.trim() : "";
  const feelingLabel = typeof body.feelingLabel === "string" ? body.feelingLabel.trim() : "";
  const intensity = isValidIntensity(body.intensity) ? body.intensity : null;
  const bodyClueKeys = isStringList(body.bodyClueKeys)
    ? Array.from(new Set(body.bodyClueKeys.map((item) => item.trim()).filter(Boolean)))
    : [];
  const notes =
    typeof body.notes === "string" ? (body.notes.trim().slice(0, 2000) || null) : null;
  const durationSeconds =
    typeof body.durationSeconds === "number" &&
    Number.isFinite(body.durationSeconds) &&
    body.durationSeconds >= 0
      ? Math.round(body.durationSeconds)
      : null;
  const completed = body.completed === true;
  const startedAt = isIsoTimestamp(body.startedAt) ? body.startedAt : new Date().toISOString();
  const completedAt =
    completed && isIsoTimestamp(body.completedAt) ? body.completedAt : completed ? new Date().toISOString() : null;
  const selectedToolKey =
    typeof body.selectedToolKey === "string" ? body.selectedToolKey.trim() || null : null;
  const selectedStrategyKeys = isStrategyKeyList(body.selectedStrategyKeys)
    ? Array.from(new Set(body.selectedStrategyKeys))
    : [];

  if (!profileId || !isZoneKey(body.zoneKey) || !feelingLabel) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const ownedProfile = await getOwnedProfile(userId, profileId);

  if (!ownedProfile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  try {
    const result = await createGuidedProfileCheckin({
      profileId: ownedProfile.id,
      zoneKey: body.zoneKey,
      feelingLabel,
      intensity,
      bodyClues: buildGuidedCheckinBodyClues(bodyClueKeys),
      notes,
      durationSeconds,
      completed,
      startedAt,
      completedAt,
      tools: buildGuidedCheckinTools(selectedToolKey),
      strategies: buildGuidedCheckinStrategies(selectedStrategyKeys),
      selectedStrategyKeys,
    });

    return NextResponse.json({
      ok: true,
      checkinId: result.id,
      profileId: ownedProfile.id,
    });
  } catch {
    return NextResponse.json({ error: "Unable to save check-in." }, { status: 500 });
  }
}
