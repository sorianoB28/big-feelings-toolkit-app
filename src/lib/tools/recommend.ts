import {
  TOOL_REGISTRY,
  getToolByKey,
  type ToolRegistryItem,
} from "@/lib/tools/registry";

export type RecommendationZone = "green" | "yellow" | "blue" | "red";
export type RecommendationIntent = "breathe" | "move" | "ground" | "support";

type RecommendToolsArgs = {
  zone: RecommendationZone;
  intent: RecommendationIntent;
};

const INTENT_PRIORITY_KEYS: Record<RecommendationIntent, string[]> = {
  breathe: [
    "circle_breathing",
    "box_breathing",
    "star_breathing",
    "infinity_breathing",
    "bubble-breathing",
  ],
  move: ["shake_out", "wall-push", "bubble-breathing"],
  ground: ["body_map", "54321-grounding", "circle_breathing"],
  support: ["ask_for_help", "talk-to-teacher", "54321-grounding"],
};

const ZONE_PRIORITY_KEYS: Record<RecommendationZone, string[]> = {
  green: ["circle_breathing", "body_map", "ask_for_help"],
  yellow: ["circle_breathing", "body_map", "wall-push"],
  blue: ["shake_out", "bubble-breathing", "body_map"],
  red: ["box_breathing", "ask_for_help", "54321-grounding"],
};

const KEY_ALIASES: Record<string, string> = {
  "bubble_breathing": "bubble-breathing",
  "talk_to_teacher": "talk-to-teacher",
  "wall_push": "wall-push",
  "body-map": "body_map",
};

function resolveTool(toolKey: string): ToolRegistryItem | null {
  const normalizedKey = KEY_ALIASES[toolKey] ?? toolKey;
  return getToolByKey(normalizedKey);
}

export function recommendTools({ zone, intent }: RecommendToolsArgs): ToolRegistryItem[] {
  const ordered = [
    ...INTENT_PRIORITY_KEYS[intent],
    ...ZONE_PRIORITY_KEYS[zone],
    ...TOOL_REGISTRY.map((tool) => tool.toolKey),
  ];

  const results: ToolRegistryItem[] = [];
  const seen = new Set<string>();

  for (const key of ordered) {
    const tool = resolveTool(key);
    if (!tool || seen.has(tool.toolKey)) {
      continue;
    }

    results.push(tool);
    seen.add(tool.toolKey);

    if (results.length === 3) {
      break;
    }
  }

  if (results.length < 3) {
    for (const fallbackTool of TOOL_REGISTRY) {
      if (seen.has(fallbackTool.toolKey)) {
        continue;
      }

      results.push(fallbackTool);
      seen.add(fallbackTool.toolKey);

      if (results.length === 3) {
        break;
      }
    }
  }

  return results.slice(0, 3);
}

