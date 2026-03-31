import type { RecommendationIntent, RecommendationZone } from "@/lib/tools/recommend";

export const TOOLKIT_FEELING_QUICK_PICKS = [
  {
    id: "mad",
    emoji: "\u{1F621}",
    label: "Mad",
    helper: "Too much big energy",
    title: "Let's move big feelings safely.",
    description: "These tools help your body push, shake, or breathe the storm out a little.",
    zone: "red",
    intent: "move",
  },
  {
    id: "worried",
    emoji: "\u{1F61F}",
    label: "Worried",
    helper: "Butterflies and what-ifs",
    title: "Let's help your body feel safer.",
    description: "Try a slower breathing or grounding tool to soften worry and unclench your body.",
    zone: "yellow",
    intent: "breathe",
  },
  {
    id: "blah",
    emoji: "\u{1F610}",
    label: "Blah",
    helper: "Stuck, tired, or foggy",
    title: "Let's wake your brain up gently.",
    description: "These tools help when your thoughts feel cloudy or your energy feels low.",
    zone: "blue",
    intent: "ground",
  },
  {
    id: "okay",
    emoji: "\u{1F60A}",
    label: "Okay",
    helper: "Pretty steady",
    title: "Let's keep that calm going.",
    description: "These tools help you stay settled, focused, and ready for what comes next.",
    zone: "green",
    intent: "ground",
  },
  {
    id: "wiggly",
    emoji: "\u{1F604}",
    label: "Wiggly",
    helper: "Lots of bouncy energy",
    title: "Let's use that energy in a helpful way.",
    description: "Try a movement or quick reset tool when your body wants to move everywhere.",
    zone: "yellow",
    intent: "move",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  emoji: string;
  label: string;
  helper: string;
  title: string;
  description: string;
  zone: RecommendationZone;
  intent: RecommendationIntent;
}>;

export type ToolkitFeelingQuickPickId = (typeof TOOLKIT_FEELING_QUICK_PICKS)[number]["id"];
export type ToolkitFeelingQuickPick = (typeof TOOLKIT_FEELING_QUICK_PICKS)[number];

export function isToolkitFeelingQuickPickId(
  value: string | null | undefined
): value is ToolkitFeelingQuickPickId {
  return TOOLKIT_FEELING_QUICK_PICKS.some((feeling) => feeling.id === value);
}

export function getToolkitFeelingQuickPick(
  id: string | null | undefined
): ToolkitFeelingQuickPick | null {
  if (!isToolkitFeelingQuickPickId(id)) {
    return null;
  }

  return TOOLKIT_FEELING_QUICK_PICKS.find((feeling) => feeling.id === id) ?? null;
}
