import "server-only";

import { db } from "@/db";
import { isToolCategory } from "@/lib/checkin-options";
import type {
  Checkin,
  CloseCheckinInput,
  CreateCheckinInput,
  StaffRecentCheckinItem,
  StudentCheckinHistoryItem,
  StudentCheckinHistoryBodyClue,
  StudentCheckinHistoryToolUse,
  StudentCheckinListItem,
  UpdateCheckinReturnToClassStepInput,
} from "@/types/checkins";
import type { AppRole } from "@/types/auth";

type CheckinRow = {
  id: string;
  return_to_class_step: string | null;
  started_at?: string;
  ended_at?: string | null;
  return_step_type?: string | null;
  return_step_text?: string | null;
  closed_by_user_id?: string | null;
};

type StudentCheckinRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  zone: string;
  intensity: number | string | null;
  feeling_words: unknown;
  selected_tool_label: string | null;
  return_to_class_step: string | null;
  return_step_type: string | null;
  return_step_text: string | null;
  closed_by_user_id: string | null;
};

type StudentCheckinHistoryRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
  zone: string;
  intensity: number | string | null;
  feeling_words: unknown;
  body_clues: unknown;
  tool_uses: unknown;
  return_to_class_step: string | null;
  return_step_type: string | null;
  return_step_text: string | null;
  closed_by_user_id: string | null;
};

type StaffRecentCheckinRow = {
  id: string;
  student_id: string;
  student_name: string;
  started_at: string;
  ended_at: string | null;
  zone: string;
  intensity: number | string | null;
  selected_tool_label: string | null;
  return_to_class_step: string | null;
};

type ActiveCheckinRow = {
  id: string;
  started_at: string;
};

type CreatedCheckinRow = {
  id: string;
  started_at: string;
  ended_at: string | null;
};

function mapCheckinRow(row: CheckinRow): Checkin {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    returnToClassStep: row.return_to_class_step,
    returnStepType: row.return_step_type,
    returnStepText: row.return_step_text,
    closedByUserId: row.closed_by_user_id,
  };
}

function parseFeelingWords(value: unknown): string[] {
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
        return parsed;
      }
    } catch {
      return [];
    }
  }

  return [];
}

function parseIntensity(value: number | string | null): number | null {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

function mapStudentCheckinRow(row: StudentCheckinRow): StudentCheckinListItem {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    zone: row.zone,
    intensity: parseIntensity(row.intensity),
    feelingWords: parseFeelingWords(row.feeling_words),
    selectedToolLabel: row.selected_tool_label,
    returnToClassStep: row.return_to_class_step,
    returnStepType: row.return_step_type,
    returnStepText: row.return_step_text,
    closedByUserId: row.closed_by_user_id,
  };
}

function parseBodyClues(value: unknown): StudentCheckinHistoryBodyClue[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const category = typeof record.category === "string" ? record.category : null;
    const symptom = typeof record.symptom === "string" ? record.symptom : null;

    if (!category || !symptom) {
      return [];
    }

    return [{ category, symptom }];
  });
}

function parseToolUses(value: unknown): StudentCheckinHistoryToolUse[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const toolCategory = typeof record.toolCategory === "string" ? record.toolCategory : null;
    const toolKey = typeof record.toolKey === "string" ? record.toolKey : null;
    const toolLabel = typeof record.toolLabel === "string" ? record.toolLabel : null;

    if (!toolCategory || !toolKey || !toolLabel) {
      return [];
    }

    return [{ toolCategory, toolKey, toolLabel }];
  });
}

function mapStudentCheckinHistoryRow(row: StudentCheckinHistoryRow): StudentCheckinHistoryItem {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    zone: row.zone,
    intensity: parseIntensity(row.intensity),
    feelingWords: parseFeelingWords(row.feeling_words),
    bodyClues: parseBodyClues(row.body_clues),
    toolUses: parseToolUses(row.tool_uses),
    returnToClassStep: row.return_to_class_step,
    returnStepType: row.return_step_type,
    returnStepText: row.return_step_text,
    closedByUserId: row.closed_by_user_id,
  };
}

function mapStaffRecentCheckinRow(row: StaffRecentCheckinRow): StaffRecentCheckinItem {
  return {
    id: row.id,
    studentId: row.student_id,
    studentName: row.student_name,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    zone: row.zone,
    intensity: parseIntensity(row.intensity),
    selectedToolLabel: row.selected_tool_label,
    returnToClassStep: row.return_to_class_step,
    status: row.ended_at ? "closed" : "active",
  };
}

function normalizeEnumValue(value: string): string {
  return value.trim().toLowerCase().replace(/-/g, "_");
}

type DashboardCheckinStatsRow = {
  active_checkins: number | string;
  tools_used_today: number | string;
};

function parseCount(value: number | string): number {
  if (typeof value === "number") {
    return value;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function listStudentCheckinsInternal(options: {
  studentId: string;
  zone?: string | null;
  limit?: number;
}): Promise<StudentCheckinListItem[]> {
  const params: Array<string | number> = [options.studentId];
  const where: string[] = ["c.student_id = $1"];

  if (options.zone) {
    params.push(options.zone);
    where.push(`c.zone = $${params.length}`);
  }

  let limitSql = "";
  if (typeof options.limit === "number") {
    params.push(Math.max(1, options.limit));
    limitSql = `limit $${params.length}`;
  }

  const result = await db.query<StudentCheckinRow>(
    `
      select
        c.id::text as id,
        c.started_at::text as started_at,
        c.ended_at::text as ended_at,
        c.zone::text as zone,
        c.intensity,
        c.feeling_words,
        c.return_to_class_step,
        c.return_step_type,
        c.return_step_text,
        c.closed_by_user_id::text as closed_by_user_id,
        first_tool.tool_label as selected_tool_label
      from checkins c
      left join lateral (
        select tu.tool_label
        from tool_uses tu
        where tu.checkin_id = c.id
        order by tu.tool_label asc
        limit 1
      ) first_tool on true
      where ${where.join(" and ")}
      order by coalesce(c.ended_at, c.started_at) desc
      ${limitSql}
    `,
    params
  );

  return result.rows.map(mapStudentCheckinRow);
}

export async function getCheckinById(checkinId: string): Promise<Checkin | null> {
  const result = await db.query<CheckinRow>(
    `
      select
        id::text as id,
        started_at::text as started_at,
        ended_at::text as ended_at,
        return_to_class_step,
        return_step_type,
        return_step_text,
        closed_by_user_id::text as closed_by_user_id
      from checkins
      where id = $1
      limit 1
    `,
    [checkinId]
  );

  const row = result.rows[0];
  return row ? mapCheckinRow(row) : null;
}

export async function updateCheckinReturnToClassStep(
  input: UpdateCheckinReturnToClassStepInput
): Promise<Checkin> {
  const result = await db.query<CheckinRow>(
    `
      update checkins
      set
        return_to_class_step = $1,
        updated_at = now()
      where id = $2
      returning
        id::text as id,
        return_to_class_step
    `,
    [input.returnToClassStep, input.checkinId]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Check-in not found.");
  }

  return mapCheckinRow(row);
}

export async function closeCheckin(input: CloseCheckinInput): Promise<Checkin> {
  const result = await db.query<CheckinRow>(
    `
      update checkins
      set
        ended_at = now(),
        return_step_type = $1,
        return_step_text = $2,
        return_to_class_step = case
          when $1 = 'sit_down' then 'Sit down'
          when $1 = 'open_notebook' then 'Open my notebook'
          when $1 = 'start_assignment' then 'Start the assignment'
          when $1 = 'raise_hand_for_help' then 'Raise my hand for help'
          when $1 = 'sip_of_water' then 'Take a sip of water'
          when $1 = 'other' then nullif($2, '')
          else return_to_class_step
        end,
        closed_by_user_id = $3,
        updated_at = now()
      where id = $4
        and ended_at is null
      returning
        id::text as id,
        started_at::text as started_at,
        ended_at::text as ended_at,
        return_to_class_step,
        return_step_type,
        return_step_text,
        closed_by_user_id::text as closed_by_user_id
    `,
    [
      input.returnStepType,
      input.returnStepText,
      input.closedByUserId,
      input.checkinId,
    ]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Active check-in not found.");
  }

  return mapCheckinRow(row);
}

export async function createCheckin(input: CreateCheckinInput): Promise<{ id: string }> {
  const client = await db.connect();

  try {
    await client.query("begin");

    const activeCheckinResult = await client.query<ActiveCheckinRow>(
      `
        select
          c.id::text as id,
          c.started_at::text as started_at
        from checkins c
        where c.student_id = $1
          and c.ended_at is null
        order by c.started_at desc
        limit 1
      `,
      [input.studentId]
    );

    const existingActive = activeCheckinResult.rows[0];
    if (existingActive) {
      await client.query("commit");
      return { id: existingActive.id };
    }

    const insertedCheckin = await client.query<CreatedCheckinRow>(
      `
        insert into checkins (
          student_id,
          created_by_user_id,
          zone,
          intensity,
          feeling_words,
          started_at,
          ended_at,
          return_to_class_step
        )
        values ($1, $2, $3, $4, $5::jsonb, now(), null, $6)
        returning
          id::text as id,
          started_at::text as started_at,
          ended_at::text as ended_at
      `,
      [
        input.studentId,
        input.createdByUserId,
        input.zone,
        input.intensity,
        JSON.stringify(input.feelingWords),
        input.returnToClassStep ?? null,
      ]
    );

    const checkinId = insertedCheckin.rows[0]?.id;
    if (!checkinId) {
      throw new Error("Failed to create check-in.");
    }

    for (const bodyClue of input.bodyClues) {
      await client.query(
        `
          insert into body_clues (checkin_id, category, symptom)
          values ($1, $2, $3)
        `,
        [checkinId, normalizeEnumValue(bodyClue.category), bodyClue.symptom]
      );
    }

    for (const toolUse of input.toolUses ?? []) {
      if (!isToolCategory(toolUse.toolCategory)) {
        throw new Error("Selected tool category is not supported.");
      }

      await client.query(
        `
          insert into tool_uses (checkin_id, tool_category, tool_key, tool_label)
          values ($1, $2, $3, $4)
        `,
        [checkinId, toolUse.toolCategory, toolUse.toolKey, toolUse.toolLabel]
      );
    }

    await client.query("commit");
    return { id: checkinId };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function getActiveCheckinForStudent(
  studentIdOrOptions: string | { studentId: string }
): Promise<{ id: string; startedAt: string } | null> {
  const studentId =
    typeof studentIdOrOptions === "string"
      ? studentIdOrOptions
      : studentIdOrOptions.studentId;

  const result = await db.query<ActiveCheckinRow>(
    `
      select
        c.id::text as id,
        c.started_at::text as started_at
      from checkins c
      where c.student_id = $1
        and c.ended_at is null
      order by c.started_at desc
      limit 1
    `,
    [studentId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    startedAt: row.started_at,
  };
}

export async function updateActiveCheckinStartData(input: {
  checkinId: string;
  zone: string;
  intensity: number | null;
  feelingWords: string[];
  bodyClues: Array<{ category: string; symptom: string }>;
}): Promise<{ id: string }> {
  const client = await db.connect();

  try {
    await client.query("begin");

    const updatedCheckin = await client.query<{ id: string }>(
      `
        update checkins
        set
          zone = $1,
          intensity = $2,
          feeling_words = $3::jsonb,
          updated_at = now()
        where id = $4
          and ended_at is null
        returning id::text as id
      `,
      [input.zone, input.intensity, JSON.stringify(input.feelingWords), input.checkinId]
    );

    const checkinId = updatedCheckin.rows[0]?.id;
    if (!checkinId) {
      throw new Error("Active check-in not found.");
    }

    await client.query(
      `
        delete from body_clues
        where checkin_id = $1
      `,
      [checkinId]
    );

    for (const bodyClue of input.bodyClues) {
      await client.query(
        `
          insert into body_clues (checkin_id, category, symptom)
          values ($1, $2, $3)
        `,
        [checkinId, normalizeEnumValue(bodyClue.category), bodyClue.symptom]
      );
    }

    await client.query("commit");
    return { id: checkinId };
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function listRecentCheckinsForStudent(options: {
  studentId: string;
  limit?: number;
}): Promise<StudentCheckinListItem[]> {
  return listStudentCheckinsInternal({
    studentId: options.studentId,
    limit: options.limit ?? 10,
  });
}

export async function getStudentCheckinHistory(
  studentId: string
): Promise<StudentCheckinHistoryItem[]> {
  const result = await db.query<StudentCheckinHistoryRow>(
    `
      select
        c.id::text as id,
        c.started_at::text as started_at,
        c.ended_at::text as ended_at,
        c.zone::text as zone,
        c.intensity,
        c.feeling_words,
        c.return_to_class_step,
        c.return_step_type,
        c.return_step_text,
        c.closed_by_user_id::text as closed_by_user_id,
        coalesce(body_clues_agg.body_clues, '[]'::jsonb) as body_clues,
        coalesce(tool_uses_agg.tool_uses, '[]'::jsonb) as tool_uses
      from checkins c
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'category', bc.category,
            'symptom', bc.symptom
          )
        ) as body_clues
        from body_clues bc
        where bc.checkin_id = c.id
      ) body_clues_agg on true
      left join lateral (
        select jsonb_agg(
          jsonb_build_object(
            'toolCategory', tu.tool_category,
            'toolKey', tu.tool_key,
            'toolLabel', tu.tool_label
          )
        ) as tool_uses
        from tool_uses tu
        where tu.checkin_id = c.id
      ) tool_uses_agg on true
      where c.student_id = $1
      order by c.started_at desc
    `,
    [studentId]
  );

  return result.rows.map(mapStudentCheckinHistoryRow);
}

export async function listCheckinsForStudent(options: {
  studentId: string;
  zone?: string | null;
}): Promise<StudentCheckinListItem[]> {
  return listStudentCheckinsInternal({
    studentId: options.studentId,
    zone: options.zone ?? null,
  });
}

export async function listRecentCheckins(options: {
  schoolId: string;
  userRole: AppRole;
  teacherId?: string | null;
  fromDate?: string | null;
  zone?: string | null;
  activeOnly?: boolean;
}): Promise<StaffRecentCheckinItem[]> {
  const params: Array<string | boolean> = [options.schoolId];
  const where: string[] = ["s.school_id = $1"];

  const normalizedZone = options.zone?.trim().toLowerCase() ?? "";
  if (normalizedZone) {
    params.push(normalizedZone);
    where.push(`c.zone = $${params.length}`);
  }

  const normalizedFromDate = options.fromDate?.trim() ?? "";
  if (normalizedFromDate) {
    params.push(normalizedFromDate);
    where.push(`c.started_at >= $${params.length}::timestamptz`);
  }

  if (options.activeOnly) {
    where.push("c.ended_at is null");
  }

  if (options.userRole === "teacher") {
    const teacherId = options.teacherId?.trim() ?? "";
    if (!teacherId) {
      return [];
    }

    params.push(teacherId);
    where.push(`(s.created_by_user_id::text = $${params.length} or cl.teacher_id::text = $${params.length})`);
  }

  const result = await db.query<StaffRecentCheckinRow>(
    `
      select
        c.id::text as id,
        s.id::text as student_id,
        s.display_name as student_name,
        c.started_at::text as started_at,
        c.ended_at::text as ended_at,
        c.zone::text as zone,
        c.intensity,
        c.return_to_class_step,
        first_tool.tool_label as selected_tool_label
      from checkins c
      inner join students s on s.id = c.student_id
      left join classrooms cl on cl.id = s.homeroom_classroom_id
      left join lateral (
        select tu.tool_label
        from tool_uses tu
        where tu.checkin_id = c.id
        limit 1
      ) first_tool on true
      where ${where.join(" and ")}
      order by c.started_at desc
      limit 300
    `,
    params
  );

  return result.rows.map(mapStaffRecentCheckinRow);
}

export async function getDashboardCheckinStats(options: {
  studentIds: string[];
}): Promise<{
  activeCheckins: number;
  toolsUsedToday: number;
}> {
  if (options.studentIds.length < 1) {
    return {
      activeCheckins: 0,
      toolsUsedToday: 0,
    };
  }

  const result = await db.query<DashboardCheckinStatsRow>(
    `
      select
        (
          select count(*)
          from checkins c
          where c.student_id::text = any($1::text[])
            and c.ended_at is null
        ) as active_checkins,
        (
          select count(*)
          from tool_uses tu
          inner join checkins c on c.id = tu.checkin_id
          where c.student_id::text = any($1::text[])
            and c.started_at >= date_trunc('day', now())
            and c.started_at < date_trunc('day', now()) + interval '1 day'
        ) as tools_used_today
    `,
    [options.studentIds]
  );

  const row = result.rows[0];
  if (!row) {
    return {
      activeCheckins: 0,
      toolsUsedToday: 0,
    };
  }

  return {
    activeCheckins: parseCount(row.active_checkins),
    toolsUsedToday: parseCount(row.tools_used_today),
  };
}
