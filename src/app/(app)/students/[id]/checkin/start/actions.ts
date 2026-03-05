"use server";

import { revalidatePath } from "next/cache";
import {
  createCheckin,
  getActiveCheckinForStudent,
  updateActiveCheckinStartData,
} from "@/db/queries/checkins";
import { getAccessibleStudentById } from "@/db/queries/students";
import {
  CHECKIN_BODY_CLUE_GROUPS,
  CHECKIN_FEELINGS,
  CHECKIN_ZONES,
} from "@/lib/checkin-options";
import { requireUser } from "@/lib/auth/require-user";

export type SaveCheckinActionResult =
  | {
      ok: true;
      checkinId: string;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeText(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseStringArrayJson(raw: string, fieldName: string): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`${fieldName} is invalid.`);
  }

  if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
    throw new Error(`${fieldName} is invalid.`);
  }

  return parsed;
}

function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("body_clue_category")) {
      return "One or more selected body clues are no longer valid. Please reselect and try again.";
    }

    return error.message;
  }

  return "Unable to save check-in. Please try again.";
}

export async function saveStudentCheckinAction(
  studentId: string,
  startedAtIso: string,
  formData: FormData
): Promise<SaveCheckinActionResult> {
  const user = await requireUser({ onUnauthorized: "throw" });
  try {
    const student = await getAccessibleStudentById({
      actorUserId: user.id,
      studentId,
    });

    if (!student) {
      throw new Error("Student not found or not accessible.");
    }

    const startedAt = new Date(startedAtIso);
    if (Number.isNaN(startedAt.getTime())) {
      throw new Error("Unable to start check-in. Please try again.");
    }

    const zoneInput = normalizeText(formData.get("zone"));
    const validZoneIds = new Set<string>(CHECKIN_ZONES.map((zone) => zone.id));
    if (!validZoneIds.has(zoneInput)) {
      throw new Error("Please select a zone.");
    }

    const feelingsInput = parseStringArrayJson(normalizeText(formData.get("feelings")), "Feelings");
    if (feelingsInput.length < 1 || feelingsInput.length > 2) {
      throw new Error("Select one or two feelings.");
    }

    const feelingLabelMap = new Map<string, string>(
      CHECKIN_FEELINGS.map((feeling) => [feeling.id, feeling.label])
    );
    const feelingWords = Array.from(new Set(feelingsInput)).map((feelingId) => {
      const label = feelingLabelMap.get(feelingId);
      if (!label) {
        throw new Error("Feelings selection is invalid.");
      }
      return label;
    });

    if (feelingWords.length < 1 || feelingWords.length > 2) {
      throw new Error("Select one or two feelings.");
    }

    const intensityInput = normalizeText(formData.get("intensity"));
    const intensity = intensityInput ? Number.parseInt(intensityInput, 10) : null;
    if (intensity !== null && (!Number.isInteger(intensity) || intensity < 1 || intensity > 10)) {
      throw new Error("Intensity must be between 1 and 10.");
    }

    const bodyClueIds = parseStringArrayJson(
      normalizeText(formData.get("body_clues")),
      "Body clues"
    );
    const bodyClueMap = new Map<string, { category: string; symptom: string }>(
      CHECKIN_BODY_CLUE_GROUPS.flatMap((group) =>
        group.clues.map(
          (clue) =>
            [
              clue.id,
              {
                // DB enum values use snake_case category names.
                category: group.id.replace(/-/g, "_"),
                symptom: clue.label,
              },
            ] as const
        )
      )
    );
    const bodyClues = Array.from(new Set(bodyClueIds)).map((bodyClueId) => {
      const bodyClue = bodyClueMap.get(bodyClueId);
      if (!bodyClue) {
        throw new Error("Body clues selection is invalid.");
      }
      return bodyClue;
    });

    const activeCheckin = await getActiveCheckinForStudent({ studentId });
    const created = activeCheckin
      ? await updateActiveCheckinStartData({
          checkinId: activeCheckin.id,
          zone: zoneInput,
          intensity,
          feelingWords,
          bodyClues,
        })
      : await createCheckin({
          studentId,
          createdByUserId: user.id,
          zone: zoneInput,
          intensity,
          feelingWords,
          startedAt: startedAt.toISOString(),
          bodyClues,
        });

    revalidatePath(`/students/${studentId}`);
    revalidatePath("/checkins");
    return {
      ok: true,
      checkinId: created.id,
    };
  } catch (error) {
    return {
      ok: false,
      error: getFriendlyErrorMessage(error),
    };
  }
}
