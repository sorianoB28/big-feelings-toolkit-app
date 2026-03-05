export const CHECKIN_ZONES = [
  { id: "green", emoji: "ðŸŸ¢", label: "Green" },
  { id: "yellow", emoji: "ðŸŸ¡", label: "Yellow" },
  { id: "blue", emoji: "ðŸ”µ", label: "Blue" },
  { id: "red", emoji: "ðŸ”´", label: "Red" },
] as const;

export type CheckinZoneId = (typeof CHECKIN_ZONES)[number]["id"];

export const CHECKIN_FEELINGS = [
  { id: "happy", emoji: "\u{1F60A}", label: "happy" },
  { id: "calm", emoji: "\u{1F60C}", label: "calm" },
  { id: "proud", emoji: "\u{1F60E}", label: "proud" },
  { id: "excited", emoji: "\u{1F929}", label: "excited" },
  { id: "silly", emoji: "\u{1F61C}", label: "silly" },
  { id: "curious", emoji: "\u{1F914}", label: "curious" },
  { id: "focused", emoji: "\u{1F9E0}", label: "focused" },
  { id: "grateful", emoji: "\u{1F64F}", label: "grateful" },
  { id: "worried", emoji: "\u{1F61F}", label: "worried" },
  { id: "nervous", emoji: "\u{1F62C}", label: "nervous" },
  { id: "frustrated", emoji: "\u{1F624}", label: "frustrated" },
  { id: "confused", emoji: "\u{1F615}", label: "confused" },
  { id: "overwhelmed", emoji: "\u{1F635}", label: "overwhelmed" },
  { id: "angry", emoji: "\u{1F621}", label: "angry" },
  { id: "annoyed", emoji: "\u{1F612}", label: "annoyed" },
  { id: "disappointed", emoji: "\u{1F61E}", label: "disappointed" },
  { id: "sad", emoji: "\u{1F614}", label: "sad" },
  { id: "lonely", emoji: "\u{1F625}", label: "lonely" },
  { id: "tired", emoji: "\u{1F62A}", label: "tired" },
  { id: "bored", emoji: "\u{1F611}", label: "bored" },
  { id: "embarrassed", emoji: "\u{1F633}", label: "embarrassed" },
  { id: "jealous", emoji: "\u{1F928}", label: "jealous" },
  { id: "stressed", emoji: "\u{1F628}", label: "stressed" },
  { id: "scared", emoji: "\u{1F631}", label: "scared" },
] as const;

export type CheckinFeelingId = (typeof CHECKIN_FEELINGS)[number]["id"];

export const CHECKIN_BODY_CLUE_GROUPS = [
  {
    id: "heart-breathing",
    label: "heart/breathing",
    clues: [
      { id: "fast-breathing", label: "Fast breathing" },
      { id: "heart-racing", label: "Heart racing" },
      { id: "tight-chest", label: "Tight chest" },
    ],
  },
  {
    id: "head-face",
    label: "head/face",
    clues: [
      { id: "headache", label: "Headache" },
      { id: "clenched-jaw", label: "Clenched jaw" },
      { id: "tense-face", label: "Tense face" },
    ],
  },
  {
    id: "stomach",
    label: "stomach",
    clues: [
      { id: "upset-stomach", label: "Upset stomach" },
      { id: "nausea", label: "Nausea" },
      { id: "butterflies", label: "Butterflies" },
    ],
  },
  {
    id: "hands-muscles",
    label: "hands/muscles",
    clues: [
      { id: "shaky-hands", label: "Shaky hands" },
      { id: "fists-clenched", label: "Fists clenched" },
      { id: "stiff-shoulders", label: "Stiff shoulders" },
    ],
  },
  {
    id: "energy-movement",
    label: "energy/movement",
    clues: [
      { id: "cannot-sit-still", label: "Cannot sit still" },
      { id: "feels-sluggish", label: "Feels sluggish" },
      { id: "pacing", label: "Pacing/restless movement" },
    ],
  },
  {
    id: "tears-sadness",
    label: "tears/sadness",
    clues: [
      { id: "watery-eyes", label: "Watery eyes" },
      { id: "crying", label: "Crying" },
      { id: "heavy-feeling", label: "Heavy feeling in body" },
    ],
  },
] as const;

export type CheckinBodyClueId = (typeof CHECKIN_BODY_CLUE_GROUPS)[number]["clues"][number]["id"];

export type ToolCategory = "calm_body" | "release_energy" | "reset_mind" | "get_support";

export const CHECKIN_TOOL_CATEGORIES = [
  {
    id: "calm_body",
    label: "Calm my body",
    tools: [
      { key: "bubble-breathing", label: "Bubble breathing" },
      { key: "star-breathing", label: "Star breathing" },
      { key: "counting-breaths", label: "Counting breaths" },
      { key: "hands-on-heart-breathing", label: "Hands on heart breathing" },
    ],
  },
  {
    id: "release_energy",
    label: "Release energy",
    tools: [
      { key: "wall-push", label: "Wall push" },
      { key: "stretch", label: "Stretch" },
      { key: "quick-walk", label: "Quick walk" },
      { key: "chair-pushups", label: "Chair push-ups" },
    ],
  },
  {
    id: "reset_mind",
    label: "Reset my mind",
    tools: [
      { key: "54321-grounding", label: "5-4-3-2-1 grounding" },
      { key: "positive-phrase", label: "Positive phrase" },
      { key: "quick-doodle", label: "Quick doodle" },
      { key: "count-backwards-20", label: "Count backwards from 20" },
    ],
  },
  {
    id: "get_support",
    label: "Get support",
    tools: [
      { key: "talk-to-teacher", label: "Talk to teacher" },
      { key: "calm-corner", label: "Calm corner" },
      { key: "ask-for-break", label: "Ask for a break" },
      { key: "check-in-counselor", label: "Check in with counselor" },
    ],
  },
  ] as const satisfies ReadonlyArray<{
    id: ToolCategory;
    label: string;
    tools: ReadonlyArray<{ key: string; label: string }>;
  }>;

const TOOL_CATEGORY_SET = new Set<ToolCategory>(
  CHECKIN_TOOL_CATEGORIES.map((category) => category.id)
);

export function isToolCategory(value: string): value is ToolCategory {
  return TOOL_CATEGORY_SET.has(value as ToolCategory);
}

export type CheckinToolCategoryId = ToolCategory;
export type CheckinToolKey = (typeof CHECKIN_TOOL_CATEGORIES)[number]["tools"][number]["key"];

