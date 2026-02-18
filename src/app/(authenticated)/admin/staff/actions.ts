"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStaffUser, getStaffScopeForUser } from "@/db/queries/staff";
import { requireUser } from "@/lib/auth/require-user";
import { isAppRole, type AppRole } from "@/types/auth";

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateEmail(email: string): string {
  const normalized = email.toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    throw new Error("A valid email address is required.");
  }

  return normalized;
}

function getAllowedEmailDomains(): string[] {
  const rawValue = process.env.ALLOWED_EMAIL_DOMAINS ?? process.env.ALLOWED_EMAIL_DOMAIN ?? "";
  const domains = rawValue
    .split(/[,;\s]+/)
    .map((domain) => domain.trim().toLowerCase())
    .filter((domain) => domain.length > 0);

  if (domains.length === 0) {
    throw new Error("ALLOWED_EMAIL_DOMAINS is not configured.");
  }

  return Array.from(new Set(domains));
}

function validateAllowedEmailDomain(email: string): void {
  const domains = getAllowedEmailDomains();
  const emailDomain = email.split("@")[1]?.toLowerCase();

  if (!emailDomain || !domains.includes(emailDomain)) {
    throw new Error(`Email domain must be one of: ${domains.join(", ")}`);
  }
}

function parseRole(roleValue: string): AppRole {
  if (!isAppRole(roleValue)) {
    throw new Error("Role must be teacher, sel_coach, or admin.");
  }

  return roleValue;
}

export async function createStaffUserAction(formData: FormData): Promise<void> {
  const admin = await requireUser({ roles: ["admin"] });
  let redirectPath = "/admin/staff";

  try {
    const scope = await getStaffScopeForUser(admin.id);
    const name = normalizeText(formData.get("name"));
    const email = validateEmail(normalizeText(formData.get("email")));
    const role = parseRole(normalizeText(formData.get("role")));
    const password = normalizeText(formData.get("temporary_password"));

    if (name.length < 1 || name.length > 120) {
      throw new Error("Name is required and must be 120 characters or less.");
    }
    if (password.length < 8 || password.length > 128) {
      throw new Error("Temporary password must be between 8 and 128 characters.");
    }

    validateAllowedEmailDomain(email);

    await createStaffUser({
      schoolId: scope.schoolId,
      name,
      email,
      role,
      password,
    });

    revalidatePath("/admin/staff");
    redirectPath = "/admin/staff?created=1";
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create staff account.";
    redirectPath = `/admin/staff/new?error=${encodeURIComponent(message)}`;
  }

  redirect(redirectPath);
}
