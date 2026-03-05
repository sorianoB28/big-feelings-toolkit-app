import type { ToolCategory } from "@/lib/checkin-options";

export type Checkin = {
  id: string;
  startedAt?: string;
  endedAt?: string | null;
  returnToClassStep: string | null;
  returnStepType?: string | null;
  returnStepText?: string | null;
  closedByUserId?: string | null;
};

export type StudentCheckinListItem = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  zone: string;
  intensity: number | null;
  feelingWords: string[];
  selectedToolLabel: string | null;
  returnToClassStep: string | null;
  returnStepType?: string | null;
  returnStepText?: string | null;
  closedByUserId?: string | null;
};

export type StudentCheckinHistoryBodyClue = {
  category: string;
  symptom: string;
};

export type StudentCheckinHistoryToolUse = {
  toolCategory: string;
  toolKey: string;
  toolLabel: string;
};

export type StudentCheckinHistoryItem = {
  id: string;
  startedAt: string;
  endedAt: string | null;
  zone: string;
  intensity: number | null;
  feelingWords: string[];
  bodyClues: StudentCheckinHistoryBodyClue[];
  toolUses: StudentCheckinHistoryToolUse[];
  returnToClassStep: string | null;
  returnStepType?: string | null;
  returnStepText?: string | null;
  closedByUserId?: string | null;
};

export type StaffRecentCheckinItem = {
  id: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  endedAt: string | null;
  zone: string;
  intensity: number | null;
  selectedToolLabel: string | null;
  returnToClassStep: string | null;
  status: "active" | "closed";
};

export type UpdateCheckinReturnToClassStepInput = {
  checkinId: string;
  returnToClassStep: string | null;
};

export type CheckinBodyClueInput = {
  category: string;
  symptom: string;
};

export type CheckinToolUseInput = {
  toolCategory: ToolCategory;
  toolKey: string;
  toolLabel: string;
};

export type CreateCheckinInput = {
  studentId: string;
  createdByUserId: string;
  zone: string;
  intensity: number | null;
  feelingWords: string[];
  startedAt?: string;
  returnToClassStep?: string | null;
  bodyClues: CheckinBodyClueInput[];
  toolUses?: CheckinToolUseInput[];
};

export type CloseCheckinInput = {
  checkinId: string;
  closedByUserId: string;
  returnStepType: string | null;
  returnStepText: string | null;
};
