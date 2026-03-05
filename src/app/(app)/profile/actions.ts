"use server";

import { redirect } from "next/navigation";
import { changeUserPassword } from "@/db/users";
import { requireUser } from "@/lib/auth/require-user";

function normalizeValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function withErrorPath(message: string): string {
  return `/profile?error=${encodeURIComponent(message)}`;
}

export async function changePasswordAction(formData: FormData): Promise<void> {
  const user = await requireUser();

  const currentPassword = normalizeValue(formData.get("current_password"));
  const newPassword = normalizeValue(formData.get("new_password"));
  const confirmPassword = normalizeValue(formData.get("confirm_new_password"));

  if (!currentPassword || !newPassword || !confirmPassword) {
    redirect(withErrorPath("Please complete all password fields."));
  }

  if (newPassword.length < 8 || newPassword.length > 128) {
    redirect(withErrorPath("New password must be between 8 and 128 characters."));
  }

  if (newPassword !== confirmPassword) {
    redirect(withErrorPath("New password and confirmation do not match."));
  }

  if (newPassword === currentPassword) {
    redirect(withErrorPath("Choose a new password that is different from your current password."));
  }

  try {
    await changeUserPassword({
      userId: user.id,
      currentPassword,
      newPassword,
    });

    redirect("/profile?updated=1");
  } catch (error) {
    const message =
      error instanceof Error && error.message === "Current password is incorrect."
        ? "Current password is incorrect."
        : "We could not update your password. Please try again.";

    redirect(withErrorPath(message));
  }
}
