import "server-only";

import { db } from "@/db";
import type { CheckinStrategyKey } from "@/lib/checkin";

export type AccountProfileSummary = {
  id: string;
  name: string;
  avatar: string | null;
  checkinCount: number;
  lastCheckinAt: string | null;
};

export type ProfileHistoryItem = {
  id: string;
  zone: "red" | "yellow" | "blue" | "green";
  feeling: string;
  strategyKeys: CheckinStrategyKey[];
  createdAt: string;
};

export type AccountProfileDetail = AccountProfileSummary & {
  history: ProfileHistoryItem[];
  lastCheckinAt: string | null;
};

type AccountProfileSummaryRow = {
  id: string;
  name: string;
  avatar: string | null;
  checkin_count: number | string;
  last_checkin_at: string | null;
};

type OwnedProfileRow = {
  id: string;
  name: string;
};

type AccountProfileDetailRow = {
  id: string;
  name: string;
  avatar: string | null;
  checkin_count: number | string;
  last_checkin_at: string | null;
};

type ProfileHistoryRow = {
  id: string;
  zone: string;
  feeling: string;
  strategy_keys: unknown;
  created_at: string;
};

function parseCount(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isStrategyKey(value: string): value is CheckinStrategyKey {
  return [
    "write-down-your-feelings",
    "journaling",
    "think-of-something-funny",
    "positive-self-talk",
    "positive-notes",
    "visualize-your-favorite-place",
    "make-a-to-do-list",
    "stretch-your-neck",
    "roll-your-shoulders",
    "close-your-eyes-and-relax",
    "press-your-hands-together",
    "count-to-10",
    "count-on-your-fingers",
    "shake-out-your-hands",
    "wall-pushes",
    "go-for-a-walk",
    "stretch-your-body",
    "talk-to-a-friend",
    "talk-to-an-adult",
    "get-a-hug",
    "do-something-kind",
    "listen-to-music",
    "play-a-game",
    "use-a-fidget",
    "find-a-comfy-spot",
    "get-a-snack",
    "get-enough-sleep",
    "draw-something",
    "build-something",
  ].includes(value as CheckinStrategyKey);
}

function parseStrategyKeys(value: unknown): CheckinStrategyKey[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string" && isStrategyKey(item))) {
    return value;
  }

  return [];
}

export async function listProfilesForUser(userId: string): Promise<AccountProfileSummary[]> {
  const result = await db.query<AccountProfileSummaryRow>(
    `
      select
        p.id::text as id,
        p.name,
        p.avatar,
        count(distinct c.id)::int as checkin_count,
        max(coalesce(c.completed_at, c.created_at))::text as last_checkin_at
      from profiles p
      left join checkins c on c.profile_id = p.id
      where p.user_id = $1
      group by p.id, p.name, p.avatar, p.created_at
      order by p.created_at asc
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    checkinCount: parseCount(row.checkin_count),
    lastCheckinAt: row.last_checkin_at,
  }));
}

export async function createProfileForUser(input: {
  userId: string;
  name: string;
  avatar: string | null;
}): Promise<AccountProfileSummary> {
  const result = await db.query<AccountProfileSummaryRow>(
    `
      insert into profiles (user_id, name, avatar)
      values ($1, $2, $3)
      returning
        id::text as id,
        name,
        avatar,
        0::int as checkin_count,
        null::text as last_checkin_at
    `,
    [input.userId, input.name, input.avatar]
  );

  const row = result.rows[0];

  if (!row) {
    throw new Error("Unable to create profile.");
  }

  return {
    id: row.id,
    name: row.name,
    avatar: row.avatar,
    checkinCount: parseCount(row.checkin_count),
    lastCheckinAt: row.last_checkin_at,
  };
}

export async function getOwnedProfile(userId: string, profileId: string): Promise<OwnedProfileRow | null> {
  const result = await db.query<OwnedProfileRow>(
    `
      select
        p.id::text as id,
        p.name
      from profiles p
      where p.user_id = $1
        and p.id = $2
      limit 1
    `,
    [userId, profileId]
  );

  return result.rows[0] ?? null;
}

export async function getProfileDetailForUser(
  userId: string,
  profileId: string
): Promise<AccountProfileDetail | null> {
  const profileResult = await db.query<AccountProfileDetailRow>(
    `
      select
        p.id::text as id,
        p.name,
        p.avatar,
        count(distinct c.id)::int as checkin_count,
        max(coalesce(c.completed_at, c.created_at))::text as last_checkin_at
      from profiles p
      left join checkins c on c.profile_id = p.id
      where p.user_id = $1
        and p.id = $2
      group by p.id, p.name, p.avatar
      limit 1
    `,
    [userId, profileId]
  );

  const profile = profileResult.rows[0];

  if (!profile) {
    return null;
  }

  const historyResult = await db.query<ProfileHistoryRow>(
    `
      select
        c.id::text as id,
        c.zone::text as zone,
        c.feeling,
        coalesce(
          jsonb_agg(cs.strategy_key order by cs.created_at asc) filter (where cs.id is not null),
          '[]'::jsonb
        ) as strategy_keys,
        coalesce(c.completed_at, c.created_at)::text as created_at
      from checkins c
      left join checkin_strategies cs on cs.checkin_id = c.id
      where c.profile_id = $1
      group by c.id, c.zone, c.feeling, c.created_at, c.completed_at
      order by coalesce(c.completed_at, c.created_at) desc
    `,
    [profileId]
  );

  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    checkinCount: parseCount(profile.checkin_count),
    lastCheckinAt: profile.last_checkin_at,
    history: historyResult.rows.flatMap((row) => {
      if (row.zone !== "red" && row.zone !== "yellow" && row.zone !== "blue" && row.zone !== "green") {
        return [];
      }

      return [
        {
          id: row.id,
          zone: row.zone,
          feeling: row.feeling,
          strategyKeys: parseStrategyKeys(row.strategy_keys),
          createdAt: row.created_at,
        },
      ];
    }),
  };
}
