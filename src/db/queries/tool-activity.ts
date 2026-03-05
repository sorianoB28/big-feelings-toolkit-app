import "server-only";

import { db } from "@/db";

const TOOL_CATEGORY = "reset_mind";
const TOOL_KEY = "54321-grounding";
const TOOL_LABEL = "5-4-3-2-1 Grounding";
const MAX_ENTRY_TEXT_LENGTH = 80;

const ENTRY_TYPES = ["see", "feel", "hear", "smell", "taste"] as const;

export type GroundingEntryType = (typeof ENTRY_TYPES)[number];

export type GroundingActivityEntryInput = {
  entryType: GroundingEntryType;
  entryText: string;
};

type CheckinRow = {
  id: string;
};

type ToolUseRow = {
  id: string;
};

function normalizeEntryText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function isGroundingEntryType(value: string): value is GroundingEntryType {
  return (ENTRY_TYPES as readonly string[]).includes(value);
}

function validateEntries(entries: GroundingActivityEntryInput[]): GroundingActivityEntryInput[] {
  if (!Array.isArray(entries) || entries.length < 1) {
    throw new Error("At least one grounding entry is required.");
  }

  return entries.map((entry) => {
    if (!isGroundingEntryType(entry.entryType)) {
      throw new Error("Grounding entry type is invalid.");
    }

    const entryText = normalizeEntryText(entry.entryText);
    if (!entryText) {
      throw new Error("Grounding entry cannot be empty.");
    }

    if (entryText.length > MAX_ENTRY_TEXT_LENGTH) {
      throw new Error(`Grounding entry must be ${MAX_ENTRY_TEXT_LENGTH} characters or less.`);
    }

    return {
      entryType: entry.entryType,
      entryText,
    };
  });
}

export async function saveGroundingActivityForCheckin(input: {
  actorUserId: string;
  checkinId: string;
  entries: GroundingActivityEntryInput[];
}): Promise<{ toolUseId: string }> {
  const validatedEntries = validateEntries(input.entries);
  const client = await db.connect();

  try {
    await client.query("begin");

    const checkinResult = await client.query<CheckinRow>(
      `
        select id::text as id
        from checkins
        where id = $1
          and created_by_user_id = $2
        limit 1
      `,
      [input.checkinId, input.actorUserId]
    );

    const checkin = checkinResult.rows[0];
    if (!checkin) {
      throw new Error("Check-in context not found.");
    }

    const existingToolUseResult = await client.query<ToolUseRow>(
      `
        select id::text as id
        from tool_uses
        where checkin_id = $1
          and tool_key = $2
        limit 1
      `,
      [input.checkinId, TOOL_KEY]
    );

    let toolUseId = existingToolUseResult.rows[0]?.id ?? null;

    if (!toolUseId) {
      const insertedToolUseResult = await client.query<ToolUseRow>(
        `
          insert into tool_uses (checkin_id, tool_category, tool_key, tool_label)
          values ($1, $2, $3, $4)
          returning id::text as id
        `,
        [input.checkinId, TOOL_CATEGORY, TOOL_KEY, TOOL_LABEL]
      );

      toolUseId = insertedToolUseResult.rows[0]?.id ?? null;
    }

    if (!toolUseId) {
      throw new Error("Could not save grounding activity.");
    }

    await client.query(
      `
        delete from tool_activity_entries
        where tool_use_id = $1
          and entry_type = any($2::text[])
      `,
      [toolUseId, ENTRY_TYPES]
    );

    for (const entry of validatedEntries) {
      await client.query(
        `
          insert into tool_activity_entries (tool_use_id, entry_type, entry_text)
          values ($1, $2, $3)
        `,
        [toolUseId, entry.entryType, entry.entryText]
      );
    }

    await client.query("commit");
    return { toolUseId };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
