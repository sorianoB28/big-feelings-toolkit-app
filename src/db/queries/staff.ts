import "server-only";

import bcrypt from "bcrypt";
import { db } from "@/db";
import { isAppRole, type AppRole } from "@/types/auth";

export type StaffListItem = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  isActive: boolean;
  createdAt: string;
};

type StaffRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
};

type StaffScopeRow = {
  school_id: string | null;
  role: string;
  is_active: boolean;
};

export type StaffScope = {
  schoolId: string;
  role: AppRole;
};

function mapStaffRow(row: StaffRow): StaffListItem {
  if (!isAppRole(row.role)) {
    throw new Error(`Invalid role "${row.role}" found in users table.`);
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export async function getStaffScopeForUser(userId: string): Promise<StaffScope> {
  const result = await db.query<StaffScopeRow>(
    `
      select
        school_id::text as school_id,
        role::text as role,
        is_active
      from users
      where id = $1
      limit 1
    `,
    [userId]
  );

  const row = result.rows[0];
  if (!row || !row.is_active) {
    throw new Error("Staff account not found or inactive.");
  }
  if (!row.school_id) {
    throw new Error("Staff user is missing school assignment.");
  }
  if (!isAppRole(row.role)) {
    throw new Error(`Invalid staff role "${row.role}".`);
  }

  return {
    schoolId: row.school_id,
    role: row.role,
  };
}

export async function listStaffBySchool(schoolId: string): Promise<StaffListItem[]> {
  const result = await db.query<StaffRow>(
    `
      select
        id::text as id,
        name,
        email,
        role::text as role,
        is_active,
        created_at::text as created_at
      from users
      where school_id = $1
      order by
        case role::text
          when 'admin' then 1
          when 'sel_coach' then 2
          else 3
        end,
        lower(coalesce(name, '')),
        lower(email)
    `,
    [schoolId]
  );

  return result.rows.map(mapStaffRow);
}

export async function createStaffUser(input: {
  schoolId: string;
  name: string;
  email: string;
  role: AppRole;
  password: string;
}): Promise<{ id: string }> {
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await db.query<{ id: string }>(
    `
      select id::text as id
      from users
      where lower(email) = $1
      limit 1
    `,
    [normalizedEmail]
  );

  if (existing.rows[0]) {
    throw new Error("A staff account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const inserted = await db.query<{ id: string }>(
    `
      insert into users (
        school_id,
        email,
        name,
        role,
        password_hash,
        is_active,
        created_at,
        updated_at
      )
      values ($1, $2, $3, $4, $5, true, now(), now())
      returning id::text as id
    `,
    [input.schoolId, normalizedEmail, input.name, input.role, passwordHash]
  );

  const row = inserted.rows[0];
  if (!row) {
    throw new Error("Failed to create staff user.");
  }

  return row;
}
