import "server-only";

import { db } from "@/db";
import type { CheckinStrategyCategoryKey, CheckinStrategyKey } from "@/lib/checkin";

export type ProfileSavedStrategy = {
  id: string;
  profileId: string;
  strategyKey: CheckinStrategyKey;
  category: CheckinStrategyCategoryKey | null;
  createdAt: string;
};

type ProfileSavedStrategyRow = {
  id: string;
  profile_id: string;
  strategy_key: CheckinStrategyKey;
  category: CheckinStrategyCategoryKey | null;
  created_at: string;
};

function mapRow(row: ProfileSavedStrategyRow): ProfileSavedStrategy {
  return {
    id: row.id,
    profileId: row.profile_id,
    strategyKey: row.strategy_key,
    category: row.category,
    createdAt: row.created_at,
  };
}

export async function listSavedStrategiesForProfile(
  profileId: string
): Promise<ProfileSavedStrategy[]> {
  const result = await db.query<ProfileSavedStrategyRow>(
    `
      select
        id::text as id,
        profile_id::text as profile_id,
        strategy_key,
        category,
        created_at::text as created_at
      from profile_saved_strategies
      where profile_id = $1
      order by created_at desc, strategy_key asc
    `,
    [profileId]
  );

  return result.rows.map(mapRow);
}

export async function saveStrategyForProfile(input: {
  profileId: string;
  strategyKey: CheckinStrategyKey;
  category: CheckinStrategyCategoryKey | null;
}): Promise<{ strategy: ProfileSavedStrategy; created: boolean }> {
  const insertResult = await db.query<ProfileSavedStrategyRow>(
    `
      insert into profile_saved_strategies (profile_id, strategy_key, category)
      values ($1, $2, $3)
      on conflict (profile_id, strategy_key) do nothing
      returning
        id::text as id,
        profile_id::text as profile_id,
        strategy_key,
        category,
        created_at::text as created_at
    `,
    [input.profileId, input.strategyKey, input.category]
  );

  const inserted = insertResult.rows[0];

  if (inserted) {
    return {
      strategy: mapRow(inserted),
      created: true,
    };
  }

  const existingResult = await db.query<ProfileSavedStrategyRow>(
    `
      select
        id::text as id,
        profile_id::text as profile_id,
        strategy_key,
        category,
        created_at::text as created_at
      from profile_saved_strategies
      where profile_id = $1
        and strategy_key = $2
      limit 1
    `,
    [input.profileId, input.strategyKey]
  );

  const existing = existingResult.rows[0];

  if (!existing) {
    throw new Error("Unable to save strategy.");
  }

  return {
    strategy: mapRow(existing),
    created: false,
  };
}

export async function removeSavedStrategyForProfile(input: {
  profileId: string;
  strategyKey: CheckinStrategyKey;
}): Promise<{ removed: boolean }> {
  const result = await db.query<{ id: string }>(
    `
      delete from profile_saved_strategies
      where profile_id = $1
        and strategy_key = $2
      returning id::text as id
    `,
    [input.profileId, input.strategyKey]
  );

  return {
    removed: Boolean(result.rows[0]?.id),
  };
}
