import "server-only";

import bcrypt from "bcrypt";
import { db } from "@/db";
import type { SignInErrorCode } from "@/lib/auth/sign-in-errors";
import type { AppRole } from "@/types/auth";
import type { AuthenticatedUser } from "@/types/auth";
import { isAppRole } from "@/types/auth";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_hash: string;
  is_active: boolean;
};

type UserRecord = Omit<UserRow, "role"> & { role: AppRole };

export type StaffProfile = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  schoolName: string | null;
};

type VerifyCredentialsResult =
  | {
      user: AuthenticatedUser;
      error: null;
    }
  | {
      user: null;
      error: SignInErrorCode;
    };

function getAllowedEmailDomains(): string[] {
  const rawDomains = process.env.ALLOWED_EMAIL_DOMAINS ?? process.env.ALLOWED_EMAIL_DOMAIN ?? "";

  return rawDomains
    .split(/[,;\s]+/)
    .map((domain) => domain.trim().toLowerCase())
    .filter((domain) => domain.length > 0);
}

function isAllowedEmailDomain(email: string): boolean {
  const allowedDomains = getAllowedEmailDomains();

  if (allowedDomains.length === 0) {
    return true;
  }

  const emailDomain = email.split("@")[1]?.toLowerCase();
  return Boolean(emailDomain && allowedDomains.includes(emailDomain));
}

export async function countUsers(): Promise<number> {
  const result = await db.query<{ count: string }>("select count(*) from users");
  const rawCount = result.rows[0]?.count ?? "0";
  const parsed = Number.parseInt(rawCount, 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const result = await db.query<UserRow>(
    `
      select
        id::text as id,
        email,
        name,
        role,
        password_hash,
        is_active
      from users
      where lower(email) = $1
      limit 1
    `,
    [normalizedEmail]
  );

  const user = result.rows[0];

  if (!user) {
    return null;
  }

  if (!isAppRole(user.role)) {
    throw new Error(`Invalid role "${user.role}" for user ${user.email}`);
  }

  return {
    ...user,
    role: user.role,
  };
}

export async function getStaffProfileById(userId: string): Promise<StaffProfile | null> {
  const result = await db.query<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    school_name: string | null;
  }>(
    `
      select
        u.id::text as id,
        u.name,
        u.email,
        u.role::text as role,
        s.name as school_name
      from users u
      left join schools s on s.id = u.school_id
      where u.id = $1
      limit 1
    `,
    [userId]
  );

  const row = result.rows[0];
  if (!row) {
    return null;
  }

  if (!isAppRole(row.role)) {
    throw new Error(`Invalid role "${row.role}" for user ${row.email}`);
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    schoolName: row.school_name,
  };
}

export async function changeUserPassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  const credentialResult = await db.query<{
    id: string;
    password_hash: string;
    is_active: boolean;
  }>(
    `
      select
        id::text as id,
        password_hash,
        is_active
      from users
      where id = $1
      limit 1
    `,
    [input.userId]
  );

  const credentialRow = credentialResult.rows[0];

  if (!credentialRow || !credentialRow.is_active) {
    throw new Error("Your account is unavailable.");
  }

  const currentPasswordValid = await bcrypt.compare(
    input.currentPassword,
    credentialRow.password_hash
  );

  if (!currentPasswordValid) {
    throw new Error("Current password is incorrect.");
  }

  const newPasswordHash = await bcrypt.hash(input.newPassword, 12);

  await db.query(
    `
      update users
      set
        password_hash = $1,
        updated_at = now()
      where id = $2
    `,
    [newPasswordHash, input.userId]
  );

  return { ok: true };
}

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<VerifyCredentialsResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      user: null,
      error: "invalid_credentials",
    };
  }

  if (!isAllowedEmailDomain(normalizedEmail)) {
    return {
      user: null,
      error: "domain_not_allowed",
    };
  }

  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    return {
      user: null,
      error: "invalid_credentials",
    };
  }

  if (!user.is_active) {
    return {
      user: null,
      error: "inactive_account",
    };
  }

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return {
      user: null,
      error: "invalid_credentials",
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    error: null,
  };
}
