import "server-only";

import type { PoolClient } from "pg";
import { db } from "@/db";
import {
  CHECKIN_BODY_CLUE_CATEGORIES,
  CHECKIN_STRATEGY_CARDS,
  type CheckinStrategyKey,
  type CheckinZoneKey,
} from "@/lib/checkin";
import { getToolByKey } from "@/lib/tools/registry";
import type { CheckinBodyClue, CheckinStrategy, CheckinTool } from "@/types/checkins";

export type CreateGuidedProfileCheckinInput = {
  clientSessionKey: string;
  profileId: string;
  zoneKey: CheckinZoneKey;
  feelingLabel: string;
  intensity: number | null;
  bodyClues: readonly CheckinBodyClue[];
  notes: string | null;
  durationSeconds: number | null;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  tools: readonly CheckinTool[];
  strategies: readonly CheckinStrategy[];
  selectedStrategyKeys: readonly CheckinStrategyKey[];
};

const strategyCategoryByKey = new Map(
  CHECKIN_STRATEGY_CARDS.map((card) => [card.key, card.category])
);

const bodyClueCategoryByKey = new Map<string, string>(
  CHECKIN_BODY_CLUE_CATEGORIES.flatMap((category) =>
    category.clues.map((clue) => [clue.key, category.key] as const)
  )
);

function isMissingSchemaSupport(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return false;
  }

  const code = (error as { code?: string }).code;
  return code === "42703" || code === "42P01";
}

async function hasClientSessionKeySupport(client: PoolClient): Promise<boolean> {
  const result = await client.query<{ has_column: boolean }>(
    `
      select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'checkins'
          and column_name = 'client_session_key'
      ) as has_column
    `
  );

  return result.rows[0]?.has_column === true;
}

async function findExistingGuidedCheckin(
  client: PoolClient,
  input: CreateGuidedProfileCheckinInput,
  useClientSessionKey: boolean
): Promise<{ id: string } | null> {
  if (useClientSessionKey) {
    const bySessionKeyResult = await client.query<{ id: string }>(
      `
        select id::text as id
        from checkins
        where client_session_key = $1
        limit 1
      `,
      [input.clientSessionKey]
    );

    const existingBySessionKey = bySessionKeyResult.rows[0];

    if (existingBySessionKey) {
      return existingBySessionKey;
    }
  }

  const byFingerprintResult = await client.query<{ id: string }>(
    `
      select id::text as id
      from checkins
      where profile_id = $1
        and zone = $2
        and feeling = $3
        and started_at = $4::timestamptz
        and completed_at is not distinct from $5::timestamptz
      order by created_at desc
      limit 1
    `,
    [input.profileId, input.zoneKey, input.feelingLabel, input.startedAt, input.completedAt]
  );

  return byFingerprintResult.rows[0] ?? null;
}

function normalizeStrategySelections(selectedStrategyKeys: readonly CheckinStrategyKey[]): CheckinStrategy[] {
  return Array.from(new Set(selectedStrategyKeys)).flatMap((strategyKey) => {
    const category = strategyCategoryByKey.get(strategyKey);

    if (!category) {
      return [];
    }

    return [
      {
        strategyKey,
        category,
      },
    ];
  });
}

function normalizeBodyClues(bodyClueKeys: readonly string[]): CheckinBodyClue[] {
  return Array.from(new Set(bodyClueKeys)).flatMap((clueKey) => {
    const category = bodyClueCategoryByKey.get(clueKey);

    if (!category) {
      return [];
    }

    return [
      {
        clueKey,
        category,
      },
    ];
  });
}

function normalizeTool(toolKey: string | null): CheckinTool[] {
  if (!toolKey) {
    return [];
  }

  const tool = getToolByKey(toolKey, "toolkit");

  if (!tool) {
    return [];
  }

  return [
    {
      toolKey: tool.toolKey,
      category: tool.category,
    },
  ];
}

async function insertLegacyGuidedProfileCheckin(
  client: PoolClient,
  input: CreateGuidedProfileCheckinInput
): Promise<{ id: string }> {
  const insertCheckinResult = await client.query<{ id: string }>(
    `
      insert into checkins (profile_id, zone, feeling)
      values ($1, $2, $3)
      returning id::text as id
    `,
    [input.profileId, input.zoneKey, input.feelingLabel]
  );

  const checkinId = insertCheckinResult.rows[0]?.id;

  if (!checkinId) {
    throw new Error("Failed to create guided check-in.");
  }

  for (const strategy of normalizeStrategySelections(input.selectedStrategyKeys)) {
    await client.query(
      `
        insert into checkin_strategies (checkin_id, strategy_key, category)
        values ($1, $2, $3)
      `,
      [checkinId, strategy.strategyKey, strategy.category]
    );
  }

  return { id: checkinId };
}

async function insertRichGuidedProfileCheckin(
  client: PoolClient,
  input: CreateGuidedProfileCheckinInput,
  useClientSessionKey: boolean
): Promise<{ id: string }> {
  const existingCheckin = await findExistingGuidedCheckin(client, input, useClientSessionKey);

  if (existingCheckin) {
    return existingCheckin;
  }

  const insertCheckinResult = await client.query<{ id: string }>(
    `
      insert into checkins (
        profile_id,
        zone,
        feeling,
        intensity,
        notes,
        duration_seconds,
        completed,
        ${useClientSessionKey ? "client_session_key," : ""}
        started_at,
        completed_at
      )
      values (
        $1, $2, $3, $4, $5, $6, $7,
        ${useClientSessionKey ? "$8," : ""}
        $${useClientSessionKey ? 9 : 8}::timestamptz,
        $${useClientSessionKey ? 10 : 9}::timestamptz
      )
      returning id::text as id
    `,
    useClientSessionKey
      ? [
          input.profileId,
          input.zoneKey,
          input.feelingLabel,
          input.intensity,
          input.notes,
          input.durationSeconds,
          input.completed,
          input.clientSessionKey,
          input.startedAt,
          input.completedAt,
        ]
      : [
          input.profileId,
          input.zoneKey,
          input.feelingLabel,
          input.intensity,
          input.notes,
          input.durationSeconds,
          input.completed,
          input.startedAt,
          input.completedAt,
        ]
  );

  const checkinId = insertCheckinResult.rows[0]?.id;

  if (!checkinId) {
    throw new Error("Failed to create guided check-in.");
  }

  for (const bodyClue of input.bodyClues) {
    await client.query(
      `
        insert into checkin_body_clues (checkin_id, clue_key, category)
        select $1, $2, $3
        where not exists (
          select 1
          from checkin_body_clues
          where checkin_id = $1
            and clue_key = $2
        )
      `,
      [checkinId, bodyClue.clueKey, bodyClue.category]
    );
  }

  for (const tool of input.tools) {
    await client.query(
      `
        insert into checkin_tools (checkin_id, tool_key, category)
        select $1, $2, $3
        where not exists (
          select 1
          from checkin_tools
          where checkin_id = $1
            and tool_key = $2
        )
      `,
      [checkinId, tool.toolKey, tool.category]
    );
  }

  for (const strategy of input.strategies) {
    await client.query(
      `
        insert into checkin_strategies (checkin_id, strategy_key, category)
        select $1, $2, $3
        where not exists (
          select 1
          from checkin_strategies
          where checkin_id = $1
            and strategy_key = $2
        )
      `,
      [checkinId, strategy.strategyKey, strategy.category]
    );
  }

  return { id: checkinId };
}

export async function createGuidedProfileCheckin(
  input: CreateGuidedProfileCheckinInput
): Promise<{ id: string }> {
  const client = await db.connect();
  const richInput: CreateGuidedProfileCheckinInput = {
    ...input,
    bodyClues: input.bodyClues.length > 0 ? input.bodyClues : normalizeBodyClues([]),
    tools: input.tools,
    strategies:
      input.strategies.length > 0
        ? input.strategies
        : normalizeStrategySelections(input.selectedStrategyKeys),
  };

  try {
    await client.query("begin");
    const useClientSessionKey = await hasClientSessionKeySupport(client);

    try {
      const result = await insertRichGuidedProfileCheckin(client, richInput, useClientSessionKey);
      await client.query("commit");
      return result;
    } catch (error) {
      await client.query("rollback");

      if (!isMissingSchemaSupport(error)) {
        throw error;
      }

      await client.query("begin");
      const result = await insertLegacyGuidedProfileCheckin(client, input);
      await client.query("commit");
      return result;
    }
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // Ignore rollback errors during cleanup.
    }

    throw error;
  } finally {
    client.release();
  }
}

export function buildGuidedCheckinBodyClues(bodyClueKeys: readonly string[]): CheckinBodyClue[] {
  return normalizeBodyClues(bodyClueKeys);
}

export function buildGuidedCheckinTools(toolKey: string | null): CheckinTool[] {
  return normalizeTool(toolKey);
}

export function buildGuidedCheckinStrategies(
  strategyKeys: readonly CheckinStrategyKey[]
): CheckinStrategy[] {
  return normalizeStrategySelections(strategyKeys);
}
