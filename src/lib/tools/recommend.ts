import { TOOL_REGISTRY, type ToolRegistryItem } from "@/lib/tools/registry";

export type RecommendationZone = "green" | "yellow" | "blue" | "red";
export type RecommendationIntent = "breathe" | "move" | "ground" | "support";
export type RecommendationMode = "quick" | "full";
export type RecommendationMatchKind = "best_match" | "alternate";

export type RecommendedTool = ToolRegistryItem & {
  matchKind: RecommendationMatchKind;
  matchLabel: string;
  reason: string;
  score: number;
};

type RecommendToolsArgs = {
  zone: RecommendationZone;
  intent: RecommendationIntent;
  mode?: RecommendationMode | null;
  bodyClues?: readonly string[] | null;
};

type ScoredTool = {
  tool: ToolRegistryItem;
  score: number;
  reasons: Array<{
    label: string;
    points: number;
    order: number;
  }>;
};

const ALL_TOOL_KEYS = TOOL_REGISTRY.map((tool) => tool.toolKey);

const INTENT_PRIORITY_KEYS: Record<RecommendationIntent, string[]> = {
  breathe: [
    "box_breathing",
    "circle_breathing",
    "star_breathing",
    "bubble-breathing",
    "54321-grounding",
    "body_map",
    "wall-push",
    "shake_out",
    "ask_for_help",
    "talk-to-teacher",
  ],
  move: [
    "wall-push",
    "shake_out",
    "bubble-breathing",
    "54321-grounding",
    "body_map",
    "star_breathing",
    "circle_breathing",
    "box_breathing",
    "ask_for_help",
    "talk-to-teacher",
  ],
  ground: [
    "54321-grounding",
    "body_map",
    "circle_breathing",
    "ask_for_help",
    "box_breathing",
    "star_breathing",
    "bubble-breathing",
    "wall-push",
    "shake_out",
    "talk-to-teacher",
  ],
  support: [
    "talk-to-teacher",
    "ask_for_help",
    "54321-grounding",
    "body_map",
    "circle_breathing",
    "box_breathing",
    "star_breathing",
    "bubble-breathing",
    "wall-push",
    "shake_out",
  ],
};

const ZONE_PRIORITY_KEYS: Record<RecommendationZone, string[]> = {
  green: [
    "circle_breathing",
    "star_breathing",
    "body_map",
    "bubble-breathing",
    "54321-grounding",
    "ask_for_help",
    "talk-to-teacher",
    "wall-push",
    "shake_out",
    "box_breathing",
  ],
  yellow: [
    "wall-push",
    "shake_out",
    "circle_breathing",
    "star_breathing",
    "bubble-breathing",
    "54321-grounding",
    "body_map",
    "ask_for_help",
    "talk-to-teacher",
    "box_breathing",
  ],
  blue: [
    "54321-grounding",
    "ask_for_help",
    "body_map",
    "shake_out",
    "bubble-breathing",
    "talk-to-teacher",
    "star_breathing",
    "circle_breathing",
    "box_breathing",
    "wall-push",
  ],
  red: [
    "box_breathing",
    "54321-grounding",
    "circle_breathing",
    "ask_for_help",
    "talk-to-teacher",
    "wall-push",
    "star_breathing",
    "bubble-breathing",
    "body_map",
    "shake_out",
  ],
};

const BREATH_TENSION_CLUES = new Set([
  "fast-breathing",
  "heart-racing",
  "tight-chest",
  "headache",
  "clenched-jaw",
  "tense-face",
]);

const BODY_TENSION_CLUES = new Set([
  "shaky-hands",
  "fists-clenched",
  "stiff-shoulders",
  "cannot-sit-still",
  "pacing",
]);

const LOW_ENERGY_CLUES = new Set([
  "feels-sluggish",
  "heavy-feeling",
  "watery-eyes",
  "crying",
]);

const STOMACH_CLUES = new Set(["upset-stomach", "nausea", "butterflies"]);
const TEARS_SUPPORT_CLUES = new Set(["watery-eyes", "crying", "heavy-feeling"]);

function hasMatchingClue(bodyClues: readonly string[], clueSet: ReadonlySet<string>): boolean {
  return bodyClues.some((clue) => clueSet.has(clue));
}

function addScore(
  scores: Map<string, ScoredTool>,
  toolKey: string,
  points: number,
  reason: string | null,
  orderRef: { current: number }
) {
  const entry = scores.get(toolKey);
  if (!entry) {
    return;
  }

  entry.score += points;

  if (reason && points > 0) {
    entry.reasons.push({
      label: reason,
      points,
      order: orderRef.current,
    });
    orderRef.current += 1;
  }
}

function createScoreMap(): Map<string, ScoredTool> {
  return new Map(
    TOOL_REGISTRY.map((tool) => [
      tool.toolKey,
      {
        tool,
        score: 0,
        reasons: [],
      },
    ])
  );
}

function buildTieBreakOrder(zone: RecommendationZone, intent: RecommendationIntent): Map<string, number> {
  const seen = new Set<string>();
  const ordered = [
    ...INTENT_PRIORITY_KEYS[intent],
    ...ZONE_PRIORITY_KEYS[zone],
    ...ALL_TOOL_KEYS,
  ];

  return new Map(
    ordered.flatMap((toolKey, index) => {
      if (seen.has(toolKey)) {
        return [];
      }

      seen.add(toolKey);
      return [[toolKey, index] as const];
    })
  );
}

function buildReason(reasons: ScoredTool["reasons"]): string {
  const ranked = [...reasons].sort((left, right) => {
    if (right.points !== left.points) {
      return right.points - left.points;
    }

    return left.order - right.order;
  });

  const uniqueReasons: string[] = [];
  for (const reason of ranked) {
    if (!uniqueReasons.includes(reason.label)) {
      uniqueReasons.push(reason.label);
    }

    if (uniqueReasons.length === 2) {
      break;
    }
  }

  if (uniqueReasons.length === 0) {
    return "Steady option for this check-in.";
  }

  return uniqueReasons.join(" • ");
}

export function recommendTools({
  zone,
  intent,
  mode = null,
  bodyClues = [],
}: RecommendToolsArgs): RecommendedTool[] {
  const scores = createScoreMap();
  const reasonOrder = { current: 0 };
  const selectedBodyClues = bodyClues ?? [];
  const hasBreathTension = hasMatchingClue(selectedBodyClues, BREATH_TENSION_CLUES);
  const hasBodyTension = hasMatchingClue(selectedBodyClues, BODY_TENSION_CLUES);
  const hasLowEnergy = hasMatchingClue(selectedBodyClues, LOW_ENERGY_CLUES);
  const hasStomachClues = hasMatchingClue(selectedBodyClues, STOMACH_CLUES);
  const hasTearsSupportClues = hasMatchingClue(selectedBodyClues, TEARS_SUPPORT_CLUES);

  if (intent === "breathe") {
    addScore(scores, "box_breathing", 7, "breathing reset", reasonOrder);
    addScore(scores, "circle_breathing", 6, "breathing reset", reasonOrder);
    addScore(scores, "star_breathing", 5, "breathing reset", reasonOrder);
    addScore(scores, "bubble-breathing", 5, "breathing reset", reasonOrder);
    addScore(scores, "body_map", 1, "slowing down", reasonOrder);
  }

  if (intent === "move") {
    addScore(scores, "wall-push", 7, "movement reset", reasonOrder);
    addScore(scores, "shake_out", 6, "movement reset", reasonOrder);
    addScore(scores, "bubble-breathing", 1, "resetting after movement", reasonOrder);
  }

  if (intent === "ground") {
    addScore(scores, "54321-grounding", 7, "grounding", reasonOrder);
    addScore(scores, "body_map", 6, "grounding", reasonOrder);
    addScore(scores, "circle_breathing", 2, "steady focus", reasonOrder);
    addScore(scores, "ask_for_help", 1, "extra support", reasonOrder);
  }

  if (intent === "support") {
    addScore(scores, "talk-to-teacher", 7, "getting support", reasonOrder);
    addScore(scores, "ask_for_help", 6, "getting support", reasonOrder);
    addScore(scores, "54321-grounding", 2, "steadying first", reasonOrder);
  }

  if (zone === "green") {
    addScore(scores, "circle_breathing", 2, "green zone", reasonOrder);
    addScore(scores, "star_breathing", 2, "green zone", reasonOrder);
    addScore(scores, "body_map", 2, "green zone", reasonOrder);
  }

  if (zone === "yellow") {
    addScore(scores, "wall-push", 3, "yellow zone", reasonOrder);
    addScore(scores, "shake_out", 3, "yellow zone", reasonOrder);
    addScore(scores, "circle_breathing", 2, "yellow zone", reasonOrder);
    addScore(scores, "star_breathing", 2, "yellow zone", reasonOrder);
    addScore(scores, "bubble-breathing", 1, "yellow zone", reasonOrder);
  }

  if (zone === "blue") {
    addScore(scores, "54321-grounding", 4, "blue zone", reasonOrder);
    addScore(scores, "ask_for_help", 3, "blue zone", reasonOrder);
    addScore(scores, "shake_out", 2, "blue zone", reasonOrder);
    addScore(scores, "body_map", 2, "blue zone", reasonOrder);
    addScore(scores, "talk-to-teacher", 1, "blue zone", reasonOrder);
  }

  if (zone === "red") {
    addScore(scores, "box_breathing", 3, "red zone", reasonOrder);
    addScore(scores, "54321-grounding", 3, "red zone", reasonOrder);
    addScore(scores, "circle_breathing", 2, "red zone", reasonOrder);
    addScore(scores, "ask_for_help", 2, "red zone", reasonOrder);
    addScore(scores, "talk-to-teacher", 1, "red zone", reasonOrder);
  }

  if (mode === "quick") {
    addScore(scores, "star_breathing", 2, "quick classroom reset", reasonOrder);
    addScore(scores, "bubble-breathing", 2, "quick classroom reset", reasonOrder);
    addScore(scores, "shake_out", 2, "quick classroom reset", reasonOrder);
    addScore(scores, "wall-push", 1, "quick classroom reset", reasonOrder);
    addScore(scores, "ask_for_help", 1, "quick classroom reset", reasonOrder);
  }

  if (mode === "full") {
    addScore(scores, "54321-grounding", 2, "full check-in", reasonOrder);
    addScore(scores, "body_map", 2, "full check-in", reasonOrder);
    addScore(scores, "box_breathing", 1, "full check-in", reasonOrder);
    addScore(scores, "circle_breathing", 1, "full check-in", reasonOrder);
    addScore(scores, "talk-to-teacher", 1, "full check-in", reasonOrder);
  }

  if (hasBreathTension) {
    addScore(scores, "box_breathing", 4, "chest or head tension", reasonOrder);
    addScore(scores, "circle_breathing", 3, "chest or head tension", reasonOrder);
    addScore(scores, "bubble-breathing", 2, "chest or head tension", reasonOrder);
    addScore(scores, "54321-grounding", 1, "settling your body", reasonOrder);
  }

  if (hasBodyTension) {
    addScore(scores, "wall-push", 4, "body tension", reasonOrder);
    addScore(scores, "shake_out", 3, "body tension", reasonOrder);
  }

  if (hasLowEnergy) {
    addScore(scores, "54321-grounding", 4, "low energy", reasonOrder);
    addScore(scores, "ask_for_help", 3, "low energy", reasonOrder);
    addScore(scores, "shake_out", 2, "low energy", reasonOrder);
    addScore(scores, "body_map", 1, "low energy", reasonOrder);
  }

  if (hasStomachClues) {
    addScore(scores, "54321-grounding", 3, "stomach knots", reasonOrder);
    addScore(scores, "body_map", 3, "stomach knots", reasonOrder);
    addScore(scores, "circle_breathing", 1, "stomach knots", reasonOrder);
  }

  if (hasTearsSupportClues) {
    addScore(scores, "ask_for_help", 2, "needing support", reasonOrder);
    addScore(scores, "talk-to-teacher", 2, "needing support", reasonOrder);
  }

  if (zone === "red" && intent === "breathe" && (hasBreathTension || hasStomachClues)) {
    addScore(scores, "box_breathing", 3, "big feelings", reasonOrder);
    addScore(scores, "circle_breathing", 2, "big feelings", reasonOrder);
    addScore(scores, "star_breathing", 1, "big feelings", reasonOrder);
  }

  if (zone === "yellow" && intent === "move" && hasBodyTension) {
    addScore(scores, "wall-push", 3, "extra energy", reasonOrder);
    addScore(scores, "shake_out", 3, "extra energy", reasonOrder);
  }

  if (zone === "blue" && hasLowEnergy) {
    addScore(scores, "54321-grounding", 3, "more ready for class", reasonOrder);
    addScore(scores, "ask_for_help", 3, "more ready for class", reasonOrder);
    addScore(scores, "talk-to-teacher", 1, "more ready for class", reasonOrder);
    addScore(scores, "box_breathing", -2, null, reasonOrder);
    addScore(scores, "circle_breathing", -2, null, reasonOrder);
  }

  if (zone === "blue" && intent === "breathe" && hasLowEnergy) {
    addScore(scores, "bubble-breathing", 2, "gentle breathing", reasonOrder);
    addScore(scores, "star_breathing", 1, "gentle breathing", reasonOrder);
  }

  if (intent === "support") {
    addScore(scores, "talk-to-teacher", 2, "trusted adult support", reasonOrder);
    addScore(scores, "ask_for_help", 2, "trusted adult support", reasonOrder);
  }

  const tieBreakOrder = buildTieBreakOrder(zone, intent);
  const ranked = Array.from(scores.values()).sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    return (
      (tieBreakOrder.get(left.tool.toolKey) ?? Number.MAX_SAFE_INTEGER) -
      (tieBreakOrder.get(right.tool.toolKey) ?? Number.MAX_SAFE_INTEGER)
    );
  });

  return ranked.slice(0, 3).map((entry, index) => ({
    ...entry.tool,
    matchKind: index === 0 ? "best_match" : "alternate",
    matchLabel: index === 0 ? "Best match" : "Alternate",
    reason: buildReason(entry.reasons),
    score: entry.score,
  }));
}
