"use server";

import { requireUser } from "@/lib/auth/require-user";
import { isToolCategory } from "@/lib/checkin-options";
import { awardBadgesForStudent } from "@/lib/badges/award";
import {
  saveGroundingActivityForCheckin,
  type GroundingActivityEntryInput,
  type GroundingEntryType,
} from "@/db/queries/tool-activity";
import { createToolUseForCheckin } from "@/db/queries/tool-uses";
import { incrementStudentPoints } from "@/db/queries/students";

const MAX_ENTRY_TEXT_LENGTH = 80;
const ENTRY_TYPE_SET = new Set<GroundingEntryType>(["see", "feel", "hear", "smell", "taste"]);
const MAX_TOOL_LABEL_LENGTH = 120;

export type SaveGroundingToolActivityActionInput = {
  checkinId?: string | null;
  entries: GroundingActivityEntryInput[];
};

export type SaveGroundingToolActivityActionResult =
  | {
      ok: true;
      persisted: boolean;
    }
  | {
      ok: false;
      error: string;
    };

export type CreateToolUseActionInput = {
  checkinId?: string | null;
  toolKey: string;
  toolCategory: string;
  label: string;
  durationSeconds: number;
  helpfulRating?: number | null;
};

export type CreateToolUseActionResult =
  | {
      ok: true;
      persisted: boolean;
      toolUseId?: string;
      awardedBadgeKeys?: string[];
      pointsAdded?: number;
    }
  | {
      ok: false;
      error: string;
    };

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeCheckinId(value: string | null | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function validateEntries(entries: GroundingActivityEntryInput[]): GroundingActivityEntryInput[] {
  if (!Array.isArray(entries) || entries.length < 1) {
    throw new Error("Add at least one grounding entry.");
  }

  return entries.map((entry) => {
    if (!ENTRY_TYPE_SET.has(entry.entryType)) {
      throw new Error("A grounding entry type is invalid.");
    }

    const entryText = normalizeText(entry.entryText);
    if (!entryText) {
      throw new Error("Grounding entries cannot be empty.");
    }

    if (entryText.length > MAX_ENTRY_TEXT_LENGTH) {
      throw new Error(`Grounding entries must be ${MAX_ENTRY_TEXT_LENGTH} characters or less.`);
    }

    return {
      entryType: entry.entryType,
      entryText,
    };
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to save grounding entries.";
}

export async function saveGroundingToolActivityAction(
  input: SaveGroundingToolActivityActionInput
): Promise<SaveGroundingToolActivityActionResult> {
  try {
    const checkinId = normalizeCheckinId(input.checkinId);
    const entries = validateEntries(input.entries);

    if (!checkinId) {
      return {
        ok: true,
        persisted: false,
      };
    }

    const user = await requireUser({ onUnauthorized: "throw" });

    await saveGroundingActivityForCheckin({
      actorUserId: user.id,
      checkinId,
      entries,
    });

    return {
      ok: true,
      persisted: true,
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}

export async function createToolUseAction(
  input: CreateToolUseActionInput
): Promise<CreateToolUseActionResult> {
  try {
    const checkinId = normalizeCheckinId(input.checkinId);
    const toolKey = normalizeText(input.toolKey);
    const toolCategory = normalizeText(input.toolCategory);
    const label = normalizeText(input.label);
    const helpfulRating = input.helpfulRating ?? null;

    if (!checkinId) {
      return {
        ok: true,
        persisted: false,
      };
    }

    if (!toolKey) {
      throw new Error("Tool key is required.");
    }

    if (!isToolCategory(toolCategory)) {
      throw new Error("Tool category is invalid.");
    }

    if (!label) {
      throw new Error("Tool label is required.");
    }

    if (label.length > MAX_TOOL_LABEL_LENGTH) {
      throw new Error(`Tool label must be ${MAX_TOOL_LABEL_LENGTH} characters or less.`);
    }

    const durationSeconds = Math.max(0, Math.round(input.durationSeconds));

    if (
      helpfulRating !== null &&
      (!Number.isInteger(helpfulRating) || helpfulRating < 1 || helpfulRating > 5)
    ) {
      throw new Error("Helpful rating must be between 1 and 5.");
    }

    const user = await requireUser({ onUnauthorized: "throw" });
    const created = await createToolUseForCheckin({
      actorUserId: user.id,
      checkinId,
      toolCategory,
      toolKey,
      toolLabel: label,
      durationSeconds,
      helpfulRating,
    });

    let awardedBadgeKeys: string[] = [];
    let pointsAdded = 0;

    try {
      if (created.wasCreated) {
        pointsAdded = 10;
        await incrementStudentPoints({
          studentId: created.studentId,
          pointsToAdd: pointsAdded,
        });
      }

      const awardResult = await awardBadgesForStudent(created.studentId);
      awardedBadgeKeys = awardResult.awardedBadgeKeys;
    } catch {
      awardedBadgeKeys = [];
      pointsAdded = 0;
    }

    return {
      ok: true,
      persisted: true,
      toolUseId: created.id,
      awardedBadgeKeys,
      pointsAdded,
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error),
    };
  }
}
