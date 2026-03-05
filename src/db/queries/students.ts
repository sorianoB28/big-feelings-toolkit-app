import "server-only";

import { db } from "@/db";
import { isAppRole, type AppRole } from "@/types/auth";

export type StudentListItem = {
  id: string;
  displayName: string;
  grade: string | null;
  homeroomClassroomId: string | null;
  homeroomClassroomName: string | null;
  avatarKey: string | null;
  themeKey: string | null;
  points: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type StudentDetail = StudentListItem & {
  schoolId: string;
  createdByUserId: string | null;
  notes: string | null;
};

export type ClassroomOption = {
  id: string;
  name: string;
};

export type StudentMutationInput = {
  displayName: string;
  grade: string | null;
  homeroomClassroomId: string | null;
  notes: string | null;
  avatarKey: string | null;
  themeKey: string | null;
  active: boolean;
};

type ActorAccess = {
  id: string;
  role: AppRole;
  schoolId: string;
};

type ActorRow = {
  id: string;
  role: string;
  school_id: string | null;
  is_active: boolean;
};

type StudentColumnRow = {
  column_name: string;
};

type StudentOptionalColumns = {
  avatarKey: boolean;
  themeKey: boolean;
  points: boolean;
};

let studentOptionalColumnsCache: StudentOptionalColumns | null = null;

async function getStudentOptionalColumns(): Promise<StudentOptionalColumns> {
  if (studentOptionalColumnsCache) {
    return studentOptionalColumnsCache;
  }

  const result = await db.query<StudentColumnRow>(
    `
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'students'
        and column_name = any($1::text[])
    `,
    [["avatar_key", "theme_key", "points"]]
  );

  const available = new Set(result.rows.map((row) => row.column_name));
  studentOptionalColumnsCache = {
    avatarKey: available.has("avatar_key"),
    themeKey: available.has("theme_key"),
    points: available.has("points"),
  };

  return studentOptionalColumnsCache;
}

function normalizeSearch(search?: string): string | null {
  const trimmed = search?.trim();
  return trimmed ? `%${trimmed}%` : null;
}

function parsePoints(value: number | string | null): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function mapListRow(row: {
  id: string;
  display_name: string;
  grade: string | null;
  homeroom_classroom_id: string | null;
  homeroom_classroom_name: string | null;
  avatar_key: string | null;
  theme_key: string | null;
  points: number | string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}): StudentListItem {
  return {
    id: row.id,
    displayName: row.display_name,
    grade: row.grade,
    homeroomClassroomId: row.homeroom_classroom_id,
    homeroomClassroomName: row.homeroom_classroom_name,
    avatarKey: row.avatar_key,
    themeKey: row.theme_key,
    points: parsePoints(row.points),
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDetailRow(row: {
  id: string;
  school_id: string;
  created_by_user_id: string | null;
  homeroom_classroom_id: string | null;
  homeroom_classroom_name: string | null;
  display_name: string;
  grade: string | null;
  notes: string | null;
  avatar_key: string | null;
  theme_key: string | null;
  points: number | string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}): StudentDetail {
  return {
    id: row.id,
    schoolId: row.school_id,
    createdByUserId: row.created_by_user_id,
    homeroomClassroomId: row.homeroom_classroom_id,
    homeroomClassroomName: row.homeroom_classroom_name,
    displayName: row.display_name,
    grade: row.grade,
    notes: row.notes,
    avatarKey: row.avatar_key,
    themeKey: row.theme_key,
    points: parsePoints(row.points),
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getActorAccess(actorUserId: string): Promise<ActorAccess> {
  const result = await db.query<ActorRow>(
    `
      select id::text as id, role::text as role, school_id::text as school_id, is_active
      from users
      where id = $1
      limit 1
    `,
    [actorUserId]
  );

  const actor = result.rows[0];
  if (!actor || !actor.is_active) {
    throw new Error("Your account is not active.");
  }
  if (!actor.school_id) {
    throw new Error("Staff user must have a school_id.");
  }
  if (!isAppRole(actor.role)) {
    throw new Error(`Invalid staff role: ${actor.role}`);
  }

  return {
    id: actor.id,
    role: actor.role,
    schoolId: actor.school_id,
  };
}

async function validateHomeroomAssignment(
  actor: ActorAccess,
  homeroomClassroomId: string | null
): Promise<void> {
  if (!homeroomClassroomId) {
    return;
  }

  const classroom = await db.query<{ id: string }>(
    `
      select c.id::text as id
      from classrooms c
      where c.id = $1
        and c.school_id = $2
      limit 1
    `,
    [homeroomClassroomId, actor.schoolId]
  );

  if (!classroom.rows[0]) {
    throw new Error("Selected homeroom classroom is not allowed for your account.");
  }
}

export async function listAccessibleStudents(options: {
  actorUserId: string;
  search?: string;
}): Promise<StudentListItem[]> {
  const actor = await getActorAccess(options.actorUserId);
  const optionalColumns = await getStudentOptionalColumns();
  const search = normalizeSearch(options.search);

  const params: Array<string> = [actor.schoolId];
  const where: string[] = ["s.school_id = $1"];

  if (actor.role === "teacher") {
    params.push(actor.id);
    where.push("(s.created_by_user_id = $2 or c.teacher_id = $2)");
  }

  if (search) {
    params.push(search);
    const idx = params.length;
    where.push(`(s.display_name ilike $${idx} or coalesce(s.grade, '') ilike $${idx})`);
  }

  const result = await db.query<{
    id: string;
    display_name: string;
    grade: string | null;
    homeroom_classroom_id: string | null;
    homeroom_classroom_name: string | null;
    avatar_key: string | null;
    theme_key: string | null;
    points: number | string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
  }>(
    `
      select
        s.id::text as id,
        s.display_name,
        s.grade,
        s.homeroom_classroom_id::text as homeroom_classroom_id,
        c.name as homeroom_classroom_name,
        ${
          optionalColumns.avatarKey ? "s.avatar_key" : "null::text as avatar_key"
        },
        ${
          optionalColumns.themeKey ? "s.theme_key" : "null::text as theme_key"
        },
        ${optionalColumns.points ? "s.points" : "0::int as points"},
        s.active,
        s.created_at::text as created_at,
        s.updated_at::text as updated_at
      from students s
      left join classrooms c on c.id = s.homeroom_classroom_id
      where ${where.join(" and ")}
      order by s.display_name asc
    `,
    params
  );

  return result.rows.map(mapListRow);
}

export async function getAccessibleStudentById(options: {
  actorUserId: string;
  studentId: string;
}): Promise<StudentDetail | null> {
  const actor = await getActorAccess(options.actorUserId);
  const optionalColumns = await getStudentOptionalColumns();
  const params: Array<string> = [options.studentId, actor.schoolId];
  let teacherFilter = "";

  if (actor.role === "teacher") {
    params.push(actor.id);
    teacherFilter = "and (s.created_by_user_id = $3 or c.teacher_id = $3)";
  }

  const result = await db.query<{
    id: string;
    school_id: string;
    created_by_user_id: string | null;
    homeroom_classroom_id: string | null;
    homeroom_classroom_name: string | null;
    display_name: string;
    grade: string | null;
    notes: string | null;
    avatar_key: string | null;
    theme_key: string | null;
    points: number | string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
  }>(
    `
      select
        s.id::text as id,
        s.school_id::text as school_id,
        s.created_by_user_id::text as created_by_user_id,
        s.homeroom_classroom_id::text as homeroom_classroom_id,
        c.name as homeroom_classroom_name,
        s.display_name,
        s.grade,
        s.notes,
        ${
          optionalColumns.avatarKey ? "s.avatar_key" : "null::text as avatar_key"
        },
        ${
          optionalColumns.themeKey ? "s.theme_key" : "null::text as theme_key"
        },
        ${optionalColumns.points ? "s.points" : "0::int as points"},
        s.active,
        s.created_at::text as created_at,
        s.updated_at::text as updated_at
      from students s
      left join classrooms c on c.id = s.homeroom_classroom_id
      where s.id = $1
        and s.school_id = $2
        ${teacherFilter}
      limit 1
    `,
    params
  );

  const row = result.rows[0];
  return row ? mapDetailRow(row) : null;
}

export async function listClassroomOptions(options: {
  actorUserId: string;
}): Promise<ClassroomOption[]> {
  const actor = await getActorAccess(options.actorUserId);
  const params = actor.role === "teacher" ? [actor.schoolId, actor.id] : [actor.schoolId];
  const teacherFilter = actor.role === "teacher" ? "and c.teacher_id = $2" : "";

  const result = await db.query<{ id: string; name: string }>(
    `
      select c.id::text as id, c.name
      from classrooms c
      where c.school_id = $1
        ${teacherFilter}
      order by c.name asc
    `,
    params
  );

  return result.rows.map((row) => ({ id: row.id, name: row.name }));
}

export async function createStudent(options: {
  actorUserId: string;
  input: StudentMutationInput;
}): Promise<{ id: string }> {
  const actor = await getActorAccess(options.actorUserId);
  const optionalColumns = await getStudentOptionalColumns();
  await validateHomeroomAssignment(actor, options.input.homeroomClassroomId);

  const columns = [
    "school_id",
    "created_by_user_id",
    "homeroom_classroom_id",
    "display_name",
    "grade",
    "notes",
  ];
  const values: Array<string | boolean | null> = [
    actor.schoolId,
    actor.id,
    options.input.homeroomClassroomId,
    options.input.displayName,
    options.input.grade,
    options.input.notes,
  ];

  if (optionalColumns.avatarKey) {
    columns.push("avatar_key");
    values.push(options.input.avatarKey);
  }

  if (optionalColumns.themeKey) {
    columns.push("theme_key");
    values.push(options.input.themeKey);
  }

  columns.push("active");
  values.push(options.input.active);
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  const result = await db.query<{ id: string }>(
    `
      insert into students (
        ${columns.join(", ")}
      )
      values (${placeholders})
      returning id::text as id
    `,
    values
  );

  const created = result.rows[0];
  if (!created) {
    throw new Error("Failed to create student.");
  }

  return created;
}

export async function updateStudent(options: {
  actorUserId: string;
  studentId: string;
  input: StudentMutationInput;
}): Promise<{ id: string }> {
  const existing = await getAccessibleStudentById({
    actorUserId: options.actorUserId,
    studentId: options.studentId,
  });

  if (!existing) {
    throw new Error("Student not found or not accessible.");
  }

  const actor = await getActorAccess(options.actorUserId);
  const optionalColumns = await getStudentOptionalColumns();
  await validateHomeroomAssignment(actor, options.input.homeroomClassroomId);

  const assignments: string[] = [
    "homeroom_classroom_id = $1",
    "display_name = $2",
    "grade = $3",
    "notes = $4",
  ];
  const values: Array<string | boolean | null> = [
    options.input.homeroomClassroomId,
    options.input.displayName,
    options.input.grade,
    options.input.notes,
  ];

  if (optionalColumns.avatarKey) {
    values.push(options.input.avatarKey);
    assignments.push(`avatar_key = $${values.length}`);
  }

  if (optionalColumns.themeKey) {
    values.push(options.input.themeKey);
    assignments.push(`theme_key = $${values.length}`);
  }

  values.push(options.input.active);
  assignments.push(`active = $${values.length}`);
  values.push(options.studentId);
  const whereParamIndex = values.length;

  const result = await db.query<{ id: string }>(
    `
      update students
      set
        ${assignments.join(",\n        ")},
        updated_at = now()
      where id = $${whereParamIndex}
      returning id::text as id
    `,
    values
  );

  const updated = result.rows[0];
  if (!updated) {
    throw new Error("Failed to update student.");
  }

  return updated;
}

export async function incrementStudentPoints(options: {
  studentId: string;
  pointsToAdd: number;
}): Promise<{ studentId: string; points: number }> {
  const optionalColumns = await getStudentOptionalColumns();
  const safePointsToAdd = Number.isFinite(options.pointsToAdd)
    ? Math.max(0, Math.round(options.pointsToAdd))
    : 0;

  if (!optionalColumns.points) {
    const existing = await db.query<{ id: string }>(
      `
        select id::text as id
        from students
        where id = $1
        limit 1
      `,
      [options.studentId]
    );

    const row = existing.rows[0];
    if (!row) {
      throw new Error("Student not found.");
    }

    return {
      studentId: row.id,
      points: 0,
    };
  }

  const result = await db.query<{ id: string; points: number | string }>(
    `
      update students
      set
        points = coalesce(points, 0) + $1,
        updated_at = now()
      where id = $2
      returning id::text as id, points
    `,
    [safePointsToAdd, options.studentId]
  );

  const row = result.rows[0];
  if (!row) {
    throw new Error("Student not found.");
  }

  return {
    studentId: row.id,
    points: parsePoints(row.points),
  };
}
