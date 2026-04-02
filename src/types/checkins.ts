import type { ToolCategory } from "@/lib/checkin-options";
import type {
  CheckinBodyClueCategoryKey,
  CheckinStrategyCategoryKey,
  CheckinStrategyKey,
  CheckinZoneKey,
} from "@/lib/checkin";

export type CheckinBodyClue = {
  clueKey: string;
  category: CheckinBodyClueCategoryKey | string;
};

export type CheckinTool = {
  toolKey: string;
  category: ToolCategory | string;
  createdAt?: string;
};

export type CheckinStrategy = {
  strategyKey: CheckinStrategyKey | string;
  category: CheckinStrategyCategoryKey | string;
  createdAt?: string;
};

export type Checkin = {
  id: string;
  profileId?: string;
  zone?: CheckinZoneKey | string;
  feeling?: string;
  intensity?: number | null;
  bodyClues?: CheckinBodyClue[];
  notes?: string | null;
  durationSeconds?: number | null;
  completed?: boolean;
  startedAt?: string;
  endedAt?: string | null;
  completedAt?: string | null;
  tools?: CheckinTool[];
  strategies?: CheckinStrategy[];
  createdAt?: string;
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
