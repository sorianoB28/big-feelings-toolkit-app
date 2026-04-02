import "server-only";

import bcrypt from "bcryptjs";
import { db } from "@/db";
import type { SignInErrorCode } from "@/lib/auth/sign-in-errors";
import type { AppRole, AuthenticatedUser } from "@/types/auth";

const DEFAULT_APP_ROLE: AppRole = "teacher";
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 128;
const MAX_EMAIL_LENGTH = 320;

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
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

export type AccountProfile = {
  id: string;
  name: string | null;
  email: string;
  role: AppRole;
  schoolName: string | null;
};

export type CreateUserAccountInput = {
  email: string;
  password: string;
};

export class AuthValidationError extends Error {
  code: "email_taken" | "invalid_email" | "weak_password" | "domain_not_allowed";

  constructor(
    code: "email_taken" | "invalid_email" | "weak_password" | "domain_not_allowed",
    message: string
  ) {
    super(message);
    this.code = code;
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

function toAuthenticatedUser(user: Pick<UserRow, "id" | "email">): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: null,
    role: DEFAULT_APP_ROLE,
  };
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function countUsers(): Promise<number> {
  const result = await db.query<{ count: string }>("select count(*) from users");
  const rawCount = result.rows[0]?.count ?? "0";
  const parsed = Number.parseInt(rawCount, 10);

  return Number.isNaN(parsed) ? 0 : parsed;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  const result = await db.query<UserRow>(
    `
      select
        id::text as id,
        email,
        password_hash
      from users
      where lower(email) = $1
      limit 1
    `,
    [normalizedEmail]
  );

  return result.rows[0] ?? null;
}

export async function getStaffProfileById(userId: string): Promise<AccountProfile | null> {
  const result = await db.query<{
    id: string;
    email: string;
  }>(
    `
      select
        id::text as id,
        email
      from users
      where id = $1
      limit 1
    `,
    [userId]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: null,
    email: row.email,
    role: DEFAULT_APP_ROLE,
    schoolName: null,
  };
}

export async function createUserAccount(input: CreateUserAccountInput): Promise<AuthenticatedUser> {
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || email.length > MAX_EMAIL_LENGTH || !isValidEmail(email)) {
    throw new AuthValidationError("invalid_email", "Enter a valid email address.");
  }

  if (!isAllowedEmailDomain(email)) {
    throw new AuthValidationError(
      "domain_not_allowed",
      "Use an approved email address to create an account."
    );
  }

  if (!password || password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    throw new AuthValidationError(
      "weak_password",
      `Use ${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH} characters.`
    );
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AuthValidationError("email_taken", "An account with that email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const result = await db.query<Pick<UserRow, "id" | "email">>(
      `
        insert into users (email, password_hash)
        values ($1, $2)
        returning id::text as id, email
      `,
      [email, passwordHash]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error("Failed to create account.");
    }

    return toAuthenticatedUser(user);
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new AuthValidationError("email_taken", "An account with that email already exists.");
    }

    throw error;
  }
}

export async function changeUserPassword(input: {
  userId: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ ok: true }> {
  const credentialResult = await db.query<UserRow>(
    `
      select
        id::text as id,
        email,
        password_hash
      from users
      where id = $1
      limit 1
    `,
    [input.userId]
  );

  const credentialRow = credentialResult.rows[0];

  if (!credentialRow) {
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
      set password_hash = $1
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
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return {
      user: null,
      error: "invalid_credentials",
    };
  }

  if (!isValidEmail(normalizedEmail)) {
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

  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return {
      user: null,
      error: "invalid_credentials",
    };
  }

  return {
    user: toAuthenticatedUser(user),
    error: null,
  };
}
