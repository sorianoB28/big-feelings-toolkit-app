import type { CheckinFeelingKey, CheckinStrategyKey, CheckinZoneKey } from "./types";

export const GUIDED_CHECKIN_STEPS = [
  {
    key: "zone",
    label: "Zone",
    shortLabel: "Zone",
    description: "Start by noticing which color zone matches your body and feelings right now.",
    href: "/check-in/zone",
  },
  {
    key: "feeling",
    label: "Feeling",
    shortLabel: "Feeling",
    description: "Pick the feeling word that gets closest to what this moment feels like.",
    href: "/check-in/feeling",
  },
  {
    key: "body-clues",
    label: "Body Clues",
    shortLabel: "Body",
    description: "Notice what your body is doing so the next step can fit what you need.",
    href: "/check-in/body-clues",
  },
  {
    key: "reset-tool",
    label: "Reset Tool",
    shortLabel: "Tool",
    description: "Use one guided reset tool that gives you a clear next step right now.",
    href: "/check-in/reset-tool",
  },
  {
    key: "more-strategies",
    label: "More Strategies",
    shortLabel: "More",
    description: "Keep exploring strategies and supports if you want more than one option.",
    href: "/check-in/more-strategies",
  },
] as const;

export type GuidedCheckInStep = (typeof GUIDED_CHECKIN_STEPS)[number];
export type GuidedCheckInStepKey = GuidedCheckInStep["key"];

export type GuidedCheckInProfileSummary = {
  id: string;
  name: string;
  avatar: string | null;
  checkinCount: number;
};

export type GuidedCheckInViewer = {
  userId: string | null;
  isAuthenticated: boolean;
  availableProfiles: readonly GuidedCheckInProfileSummary[];
};

export type GuidedCheckInState = {
  profileId: string | null;
  profileName: string | null;
  startedAt: string | null;
  intensity: number | null;
  notes: string | null;
  zoneKey: CheckinZoneKey | null;
  feelingKey: CheckinFeelingKey | null;
  feelingDetailKey: string | null;
  feelingDetailLabel: string | null;
  bodyClueKeys: string[];
  selectedToolKey: string | null;
  selectedStrategyKeys: CheckinStrategyKey[];
  completed: boolean;
  completedAt: string | null;
  persistedCheckinId: string | null;
};

export const INITIAL_GUIDED_CHECKIN_STATE: GuidedCheckInState = {
  profileId: null,
  profileName: null,
  startedAt: null,
  intensity: null,
  notes: null,
  zoneKey: null,
  feelingKey: null,
  feelingDetailKey: null,
  feelingDetailLabel: null,
  bodyClueKeys: [],
  selectedToolKey: null,
  selectedStrategyKeys: [],
  completed: false,
  completedAt: null,
  persistedCheckinId: null,
};

const GUIDED_CHECKIN_STEP_MAP = new Map<GuidedCheckInStepKey, GuidedCheckInStep>(
  GUIDED_CHECKIN_STEPS.map((step) => [step.key, step])
);

export function isGuidedCheckInStepKey(value: string): value is GuidedCheckInStepKey {
  return GUIDED_CHECKIN_STEP_MAP.has(value as GuidedCheckInStepKey);
}

export function getGuidedCheckInStep(key: string): GuidedCheckInStep | null {
  if (!isGuidedCheckInStepKey(key)) {
    return null;
  }

  return GUIDED_CHECKIN_STEP_MAP.get(key) ?? null;
}

export function getGuidedCheckInStepIndex(stepKey: GuidedCheckInStepKey): number {
  return GUIDED_CHECKIN_STEPS.findIndex((step) => step.key === stepKey);
}

export function getPreviousGuidedCheckInStep(
  stepKey: GuidedCheckInStepKey
): GuidedCheckInStep | null {
  const currentIndex = getGuidedCheckInStepIndex(stepKey);

  if (currentIndex <= 0) {
    return null;
  }

  return GUIDED_CHECKIN_STEPS[currentIndex - 1] ?? null;
}

export function getNextGuidedCheckInStep(stepKey: GuidedCheckInStepKey): GuidedCheckInStep | null {
  const currentIndex = getGuidedCheckInStepIndex(stepKey);

  if (currentIndex < 0 || currentIndex >= GUIDED_CHECKIN_STEPS.length - 1) {
    return null;
  }

  return GUIDED_CHECKIN_STEPS[currentIndex + 1] ?? null;
}
