"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createStudent, updateStudent, type StudentMutationInput } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseStudentInput(formData: FormData): StudentMutationInput {
  const displayName = normalizeText(formData.get("display_name"));
  const gradeInput = normalizeText(formData.get("grade"));
  const classroomInput = normalizeText(formData.get("homeroom_classroom_id"));
  const notesInput = normalizeText(formData.get("notes"));
  const active = formData.get("active") === "on";

  if (displayName.length < 1 || displayName.length > 120) {
    throw new Error("Display name is required and must be 120 characters or less.");
  }

  if (gradeInput.length > 20) {
    throw new Error("Grade must be 20 characters or less.");
  }

  if (notesInput.length > 2000) {
    throw new Error("Notes must be 2000 characters or less.");
  }

  if (classroomInput && !uuidPattern.test(classroomInput)) {
    throw new Error("Homeroom classroom id is invalid.");
  }

  return {
    displayName,
    grade: gradeInput || null,
    homeroomClassroomId: classroomInput || null,
    notes: notesInput || null,
    active,
  };
}

function withErrorPath(basePath: string, error: unknown): string {
  const message = error instanceof Error ? error.message : "Unable to save student.";
  return `${basePath}?error=${encodeURIComponent(message)}`;
}

export async function createStudentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  let redirectPath = "/students";
  try {
    const input = parseStudentInput(formData);
    const created = await createStudent({
      actorUserId: user.id,
      input,
    });
    if (!created?.id) {
      throw new Error("Unable to create student record.");
    }

    revalidatePath("/students");
    redirectPath = `/students/${created.id}`;
  } catch (error) {
    redirectPath = withErrorPath("/students/new", error);
  }

  redirect(redirectPath);
}

export async function updateStudentAction(studentId: string, formData: FormData): Promise<void> {
  const user = await requireUser();
  let redirectPath = `/students/${studentId}`;
  try {
    const input = parseStudentInput(formData);
    await updateStudent({
      actorUserId: user.id,
      studentId,
      input,
    });

    revalidatePath("/students");
    revalidatePath(`/students/${studentId}`);
    redirectPath = `/students/${studentId}`;
  } catch (error) {
    redirectPath = withErrorPath(`/students/${studentId}/edit`, error);
  }

  redirect(redirectPath);
}
