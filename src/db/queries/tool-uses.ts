import "server-only";

import { db } from "@/db";

type CheckinRow = {
  id: string;
  student_id: string;
};

type ToolUseRow = {
  id: string;
};

type ToolUseColumnRow = {
  column_name: string;
};

type CreateToolUseForCheckinInput = {
  actorUserId: string;
  checkinId: string;
  toolCategory: string;
  toolKey: string;
  toolLabel: string;
  durationSeconds: number;
  helpfulRating: number | null;
};

const OPTIONAL_TOOL_USE_COLUMNS = ["duration_seconds", "helpful_rating"] as const;

function clampDurationSeconds(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.round(value));
}

function normalizeHelpfulRating(value: number | null): number | null {
  if (value === null) {
    return null;
  }

  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new Error("Helpful rating must be between 1 and 5.");
  }

  return value;
}

export async function createToolUseForCheckin(input: CreateToolUseForCheckinInput): Promise<{
  id: string;
  studentId: string;
  wasCreated: boolean;
}> {
  const client = await db.connect();

  try {
    await client.query("begin");

    const checkinResult = await client.query<CheckinRow>(
      `
        select
          id::text as id,
          student_id::text as student_id
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

    const availableColumnsResult = await client.query<ToolUseColumnRow>(
      `
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'tool_uses'
          and column_name = any($1::text[])
      `,
      [OPTIONAL_TOOL_USE_COLUMNS]
    );

    const availableColumns = new Set(availableColumnsResult.rows.map((row) => row.column_name));
    const durationSeconds = clampDurationSeconds(input.durationSeconds);
    const helpfulRating = normalizeHelpfulRating(input.helpfulRating);

    const existingToolUseResult = await client.query<ToolUseRow>(
      `
        select id::text as id
        from tool_uses
        where checkin_id = $1
          and tool_key = $2
        limit 1
      `,
      [input.checkinId, input.toolKey]
    );

    const existingToolUseId = existingToolUseResult.rows[0]?.id ?? null;
    if (existingToolUseId) {
      const updateAssignments: string[] = [];
      const updateValues: Array<string | number | null> = [];

      if (availableColumns.has("duration_seconds")) {
        updateValues.push(durationSeconds);
        updateAssignments.push(`duration_seconds = $${updateValues.length}`);
      }

      if (availableColumns.has("helpful_rating")) {
        updateValues.push(helpfulRating);
        updateAssignments.push(`helpful_rating = $${updateValues.length}`);
      }

      if (updateAssignments.length > 0) {
        updateValues.push(existingToolUseId);
        await client.query(
          `
            update tool_uses
            set ${updateAssignments.join(", ")}
            where id = $${updateValues.length}
          `,
          updateValues
        );
      }

      await client.query("commit");
      return {
        id: existingToolUseId,
        studentId: checkin.student_id,
        wasCreated: false,
      };
    }

    const columns = ["checkin_id", "tool_category", "tool_key", "tool_label"];
    const values: Array<string | number | null> = [
      input.checkinId,
      input.toolCategory,
      input.toolKey,
      input.toolLabel,
    ];

    if (availableColumns.has("duration_seconds")) {
      columns.push("duration_seconds");
      values.push(durationSeconds);
    }

    if (availableColumns.has("helpful_rating")) {
      columns.push("helpful_rating");
      values.push(helpfulRating);
    }

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const insertResult = await client.query<ToolUseRow>(
      `
        insert into tool_uses (${columns.join(", ")})
        values (${placeholders})
        returning id::text as id
      `,
      values
    );

    const toolUseId = insertResult.rows[0]?.id;
    if (!toolUseId) {
      throw new Error("Could not save tool completion.");
    }

    await client.query("commit");

    return {
      id: toolUseId,
      studentId: checkin.student_id,
      wasCreated: true,
    };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}
