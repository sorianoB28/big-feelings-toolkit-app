"use server";

import { revalidatePath } from "next/cache";
import { closeCheckin } from "@/db/queries/checkins";
import { getAccessibleStudentById } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";

type ReturnStepType =
  | "sit_down"
  | "open_notebook"
  | "start_assignment"
  | "raise_hand_for_help"
  | "sip_of_water"
  | "other";

const VALID_RETURN_STEP_TYPES = new Set<ReturnStepType>([
  "sit_down",
  "open_notebook",
  "start_assignment",
  "raise_hand_for_help",
  "sip_of_water",
  "other",
]);

const MAX_RETURN_STEP_TEXT_LENGTH = 80;

export type CloseStudentCheckinActionResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to close check-in. Please try again.";
}

export async function closeStudentCheckinAction(
  studentId: string,
  checkinId: string,
  formData: FormData
): Promise<CloseStudentCheckinActionResult> {
  try {
    const user = await requireUser({ onUnauthorized: "throw" });

    const student = await getAccessibleStudentById({
      actorUserId: user.id,
      studentId,
    });

    if (!student) {
      throw new Error("Student not found or not accessible.");
    }

    const returnStepTypeInput = normalizeText(formData.get("return_step_type"));
    if (!VALID_RETURN_STEP_TYPES.has(returnStepTypeInput as ReturnStepType)) {
      throw new Error("Please choose a first step back.");
    }

    const returnStepType = returnStepTypeInput as ReturnStepType;
    const returnStepTextInput = normalizeText(formData.get("return_step_text"));

    const returnStepText =
      returnStepType === "other" ? returnStepTextInput : returnStepTextInput || null;

    if (returnStepType === "other" && !returnStepText) {
      throw new Error("Please enter your first step back.");
    }

    if (returnStepText && returnStepText.length > MAX_RETURN_STEP_TEXT_LENGTH) {
      throw new Error(`First step text must be ${MAX_RETURN_STEP_TEXT_LENGTH} characters or less.`);
    }

    await closeCheckin({
      checkinId,
      closedByUserId: user.id,
      returnStepType,
      returnStepText,
    });

    revalidatePath(`/students/${studentId}`);
    revalidatePath(`/students/${studentId}/checkins`);
    revalidatePath("/checkins");

    return {
      ok: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}
