import type { ToolDefinition } from "@/lib/tools/registry";
import { getToolByKey } from "@/lib/tools/registry";
import { CHECKIN_STRATEGY_CARDS } from "./content";
import type { GuidedCheckInState } from "./flow";
import type { CheckinStrategyCategoryKey, CheckinStrategyKey, CheckinZoneKey } from "./types";

export type CheckinRecommendationInput = Pick<
  GuidedCheckInState,
  "zoneKey" | "feelingKey" | "feelingDetailKey" | "bodyClueKeys"
>;

type RecommendationRuleContext = {
  zoneKey: CheckinZoneKey | null;
  feelingKey: string | null;
  feelingDetailKey: string | null;
  emotionKeys: Set<string>;
  bodyClueKeys: Set<string>;
  hasEmotion: (...keys: string[]) => boolean;
  hasBodyClue: (...keys: string[]) => boolean;
  inZone: (...zones: CheckinZoneKey[]) => boolean;
};

type ScoreEntry<TKey extends string> = {
  key: TKey;
  points: number;
};

type RecommendationRule = {
  id: string;
  when: (context: RecommendationRuleContext) => boolean;
  toolScores?: readonly ScoreEntry<string>[];
  strategyCategoryScores?: readonly ScoreEntry<CheckinStrategyCategoryKey>[];
  strategyScores?: readonly ScoreEntry<CheckinStrategyKey>[];
  supportMessage?: string;
  supportWeight?: number;
};

export type CheckinRecommendation = {
  primaryTool: ToolDefinition | null;
  alternateTools: ToolDefinition[];
  recommendedStrategyIds: CheckinStrategyKey[];
  recommendedStrategyCategoryKeys: CheckinStrategyCategoryKey[];
  supportMessage?: string;
};

const TOOL_TIE_BREAK_ORDER = [
  "bubble-breathing",
  "box_breathing",
  "circle_breathing",
  "infinity_breathing",
  "star_breathing",
  "54321-grounding",
  "ground-and-notice",
  "color-calm",
  "positive-phrase-builder",
  "body_map",
  "wall-push",
  "shake_out",
  "stretch-flow",
  "ask_for_help",
  "talk-to-teacher",
] as const;

type ToolkitToolKey = (typeof TOOL_TIE_BREAK_ORDER)[number];

const TOOL_TIE_BREAK_RANK = new Map(TOOL_TIE_BREAK_ORDER.map((toolKey, index) => [toolKey, index]));

const AVAILABLE_TOOL_KEYS = TOOL_TIE_BREAK_ORDER.filter((toolKey) =>
  getToolByKey(toolKey, "toolkit")
);
const AVAILABLE_STRATEGY_CARDS = CHECKIN_STRATEGY_CARDS.filter(
  (card) => card.imageStatus === "ready"
);
const STRATEGY_CARD_ORDER = new Map(
  AVAILABLE_STRATEGY_CARDS.map((card, index) => [card.key, index])
);

const ZONE_TOOL_FALLBACKS: Record<CheckinZoneKey, readonly ToolkitToolKey[]> = {
  red: ["bubble-breathing", "54321-grounding", "box_breathing", "ask_for_help"],
  yellow: ["wall-push", "shake_out", "stretch-flow", "bubble-breathing"],
  blue: ["ground-and-notice", "54321-grounding", "positive-phrase-builder", "ask_for_help"],
  green: ["ground-and-notice", "color-calm", "circle_breathing", "positive-phrase-builder"],
};

const ZONE_STRATEGY_FALLBACKS: Record<CheckinZoneKey, readonly CheckinStrategyKey[]> = {
  red: ["count-to-10", "close-your-eyes-and-relax", "talk-to-an-adult", "roll-your-shoulders"],
  yellow: ["wall-pushes", "shake-out-your-hands", "stretch-your-body", "count-on-your-fingers"],
  blue: ["find-a-comfy-spot", "listen-to-music", "talk-to-an-adult", "get-a-snack"],
  green: ["journaling", "draw-something", "positive-notes", "build-something"],
};

const RULES: readonly RecommendationRule[] = [
  {
    id: "zone-red-base",
    when: (context) => context.inZone("red"),
    toolScores: [
      { key: "bubble-breathing", points: 5 },
      { key: "54321-grounding", points: 4 },
      { key: "box_breathing", points: 4 },
      { key: "ask_for_help", points: 2 },
      { key: "talk-to-teacher", points: 1 },
    ],
    strategyCategoryScores: [
      { key: "body-calmers", points: 3 },
      { key: "social-support", points: 2 },
      { key: "calm-your-mind", points: 1 },
    ],
    supportMessage: "Start with one simple calming step that helps strong feelings come down first.",
    supportWeight: 1,
  },
  {
    id: "zone-yellow-base",
    when: (context) => context.inZone("yellow"),
    toolScores: [
      { key: "wall-push", points: 5 },
      { key: "shake_out", points: 4 },
      { key: "stretch-flow", points: 4 },
      { key: "bubble-breathing", points: 2 },
      { key: "ground-and-notice", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "release-energy", points: 4 },
      { key: "body-calmers", points: 2 },
      { key: "calm-your-mind", points: 1 },
    ],
    supportMessage: "Your body may need safe movement before a quieter tool will feel useful.",
    supportWeight: 1,
  },
  {
    id: "zone-blue-base",
    when: (context) => context.inZone("blue"),
    toolScores: [
      { key: "ground-and-notice", points: 5 },
      { key: "54321-grounding", points: 4 },
      { key: "positive-phrase-builder", points: 4 },
      { key: "ask_for_help", points: 3 },
      { key: "color-calm", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "safe-distractions", points: 3 },
      { key: "social-support", points: 2 },
      { key: "basic-needs-self-care", points: 2 },
      { key: "calm-your-mind", points: 1 },
    ],
    supportMessage: "A gentle grounding or support step may help when your energy feels low or heavy.",
    supportWeight: 1,
  },
  {
    id: "zone-green-base",
    when: (context) => context.inZone("green"),
    toolScores: [
      { key: "ground-and-notice", points: 4 },
      { key: "color-calm", points: 3 },
      { key: "circle_breathing", points: 2 },
      { key: "positive-phrase-builder", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "creative-outlets", points: 3 },
      { key: "calm-your-mind", points: 2 },
      { key: "safe-distractions", points: 1 },
    ],
    supportMessage: "You may be ready for a reflective tool that helps you stay steady and focused.",
    supportWeight: 1,
  },
  {
    id: "breath-anxiety",
    when: (context) =>
      context.hasEmotion("worried", "nervous", "scared", "terrified", "afraid", "fearful") ||
      context.hasBodyClue(
        "fast-heartbeat",
        "breathing-fast",
        "holding-my-breath",
        "hard-to-breathe",
        "butterflies"
      ),
    toolScores: [
      { key: "bubble-breathing", points: 6 },
      { key: "box_breathing", points: 5 },
      { key: "circle_breathing", points: 4 },
      { key: "54321-grounding", points: 3 },
      { key: "ground-and-notice", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "body-calmers", points: 4 },
      { key: "calm-your-mind", points: 3 },
    ],
    strategyScores: [
      { key: "count-to-10", points: 3 },
      { key: "count-on-your-fingers", points: 3 },
      { key: "close-your-eyes-and-relax", points: 2 },
      { key: "visualize-your-favorite-place", points: 2 },
    ],
    supportMessage: "Breathing and grounding are a good match when your body feels fast, tight, or alert.",
    supportWeight: 4,
  },
  {
    id: "movement-energy",
    when: (context) =>
      context.hasEmotion("hyper", "excited", "silly") ||
      context.hasBodyClue(
        "cant-sit-still",
        "restless",
        "need-to-move",
        "bouncing-fidgety"
      ),
    toolScores: [
      { key: "wall-push", points: 6 },
      { key: "shake_out", points: 5 },
      { key: "stretch-flow", points: 4 },
      { key: "ground-and-notice", points: 1 },
    ],
    strategyCategoryScores: [
      { key: "release-energy", points: 5 },
      { key: "body-calmers", points: 2 },
    ],
    strategyScores: [
      { key: "wall-pushes", points: 4 },
      { key: "shake-out-your-hands", points: 4 },
      { key: "stretch-your-body", points: 3 },
      { key: "go-for-a-walk", points: 3 },
    ],
    supportMessage: "Safe movement may help your body use up extra energy before you ask it to settle.",
    supportWeight: 4,
  },
  {
    id: "angry-body-tension",
    when: (context) =>
      context.hasEmotion(
        "angry",
        "mad",
        "irritated",
        "annoyed",
        "bothered",
        "frustrated",
        "hurt",
        "defensive",
        "furious",
        "upset"
      ) ||
      context.hasBodyClue("clenched-fists", "tight-shoulders", "tight-jaw", "hot-face", "sweaty"),
    toolScores: [
      { key: "wall-push", points: 5 },
      { key: "shake_out", points: 4 },
      { key: "stretch-flow", points: 4 },
      { key: "circle_breathing", points: 2 },
      { key: "box_breathing", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "release-energy", points: 4 },
      { key: "body-calmers", points: 3 },
    ],
    strategyScores: [
      { key: "wall-pushes", points: 4 },
      { key: "shake-out-your-hands", points: 3 },
      { key: "roll-your-shoulders", points: 3 },
      { key: "press-your-hands-together", points: 2 },
    ],
    supportMessage: "Strong tension often responds best to safe movement first, then a calmer follow-up step.",
    supportWeight: 3,
  },
  {
    id: "freeze-shutdown",
    when: (context) =>
      context.hasEmotion("discouraged", "super-sad", "overwhelmed") ||
      context.hasBodyClue("stuck", "blank-mind", "quiet", "cant-talk"),
    toolScores: [
      { key: "54321-grounding", points: 6 },
      { key: "ground-and-notice", points: 5 },
      { key: "ask_for_help", points: 4 },
      { key: "positive-phrase-builder", points: 3 },
      { key: "color-calm", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "social-support", points: 4 },
      { key: "safe-distractions", points: 3 },
      { key: "calm-your-mind", points: 2 },
      { key: "basic-needs-self-care", points: 1 },
    ],
    strategyScores: [
      { key: "find-a-comfy-spot", points: 4 },
      { key: "talk-to-an-adult", points: 4 },
      { key: "use-a-fidget", points: 3 },
      { key: "get-a-hug", points: 2 },
    ],
    supportMessage: "When you feel stuck or blank, a low-demand grounding step and gentle support often help most.",
    supportWeight: 5,
  },
  {
    id: "tearful-support",
    when: (context) =>
      context.hasEmotion("sad", "super-sad", "heartbroken", "lonely", "depressed", "unhappy") ||
      context.hasBodyClue("lump-in-throat", "watery-eyes", "want-to-cry"),
    toolScores: [
      { key: "bubble-breathing", points: 4 },
      { key: "circle_breathing", points: 4 },
      { key: "ask_for_help", points: 4 },
      { key: "talk-to-teacher", points: 3 },
      { key: "positive-phrase-builder", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "social-support", points: 5 },
      { key: "body-calmers", points: 2 },
      { key: "safe-distractions", points: 2 },
    ],
    strategyScores: [
      { key: "talk-to-an-adult", points: 4 },
      { key: "get-a-hug", points: 4 },
      { key: "talk-to-a-friend", points: 3 },
      { key: "listen-to-music", points: 2 },
      { key: "find-a-comfy-spot", points: 2 },
    ],
    supportMessage: "When tears or a lump-in-the-throat feeling show up, calm support and connection can help first.",
    supportWeight: 5,
  },
  {
    id: "stomach-distress",
    when: (context) =>
      context.hasBodyClue("butterflies", "stomach-hurts", "feel-sick", "not-hungry", "too-hungry"),
    toolScores: [
      { key: "body_map", points: 5 },
      { key: "54321-grounding", points: 4 },
      { key: "ground-and-notice", points: 3 },
      { key: "circle_breathing", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "basic-needs-self-care", points: 4 },
      { key: "body-calmers", points: 2 },
      { key: "calm-your-mind", points: 1 },
    ],
    strategyScores: [
      { key: "get-a-snack", points: 4 },
      { key: "count-on-your-fingers", points: 2 },
      { key: "count-to-10", points: 2 },
      { key: "find-a-comfy-spot", points: 1 },
    ],
    supportMessage: "Body clues in your stomach can be a sign to slow down, ground, and check basic needs too.",
    supportWeight: 3,
  },
  {
    id: "low-energy",
    when: (context) =>
      context.hasEmotion("tired", "discouraged", "bored", "sick") ||
      context.hasBodyClue("heavy-eyes", "quiet", "not-hungry"),
    toolScores: [
      { key: "ground-and-notice", points: 4 },
      { key: "54321-grounding", points: 4 },
      { key: "positive-phrase-builder", points: 3 },
      { key: "ask_for_help", points: 3 },
      { key: "color-calm", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "basic-needs-self-care", points: 3 },
      { key: "safe-distractions", points: 2 },
      { key: "social-support", points: 2 },
    ],
    strategyScores: [
      { key: "get-enough-sleep", points: 4 },
      { key: "get-a-snack", points: 3 },
      { key: "find-a-comfy-spot", points: 2 },
      { key: "talk-to-an-adult", points: 2 },
    ],
    supportMessage: "Low-energy moments often respond best to gentle grounding and low-pressure support.",
    supportWeight: 3,
  },
  {
    id: "ready-reflective",
    when: (context) =>
      context.hasEmotion("happy", "calm", "thoughtful", "okay", "confident", "curious"),
    toolScores: [
      { key: "ground-and-notice", points: 3 },
      { key: "color-calm", points: 3 },
      { key: "positive-phrase-builder", points: 2 },
      { key: "circle_breathing", points: 2 },
    ],
    strategyCategoryScores: [
      { key: "creative-outlets", points: 3 },
      { key: "calm-your-mind", points: 2 },
    ],
    strategyScores: [
      { key: "draw-something", points: 3 },
      { key: "build-something", points: 3 },
      { key: "journaling", points: 2 },
      { key: "positive-notes", points: 2 },
    ],
    supportMessage: "A reflective tool can help you stay steady and notice what is working for you.",
    supportWeight: 2,
  },
];

function createContext(input: CheckinRecommendationInput): RecommendationRuleContext {
  const emotionKeys = new Set<string>();

  if (input.feelingKey) {
    emotionKeys.add(input.feelingKey);
  }

  if (input.feelingDetailKey) {
    emotionKeys.add(input.feelingDetailKey);
  }

  const bodyClueKeys = new Set(input.bodyClueKeys ?? []);

  return {
    zoneKey: input.zoneKey,
    feelingKey: input.feelingKey,
    feelingDetailKey: input.feelingDetailKey,
    emotionKeys,
    bodyClueKeys,
    hasEmotion: (...keys) => keys.some((key) => emotionKeys.has(key)),
    hasBodyClue: (...keys) => keys.some((key) => bodyClueKeys.has(key)),
    inZone: (...zones) => (input.zoneKey ? zones.includes(input.zoneKey) : false),
  };
}

function increment<TKey extends string>(scores: Map<TKey, number>, key: TKey, points: number) {
  scores.set(key, (scores.get(key) ?? 0) + points);
}

function applyToolScores(
  scores: Map<string, number>,
  entries: readonly ScoreEntry<string>[] | undefined
) {
  if (!entries) {
    return;
  }

  for (const entry of entries) {
    if (!getToolByKey(entry.key, "toolkit")) {
      continue;
    }

    increment(scores, entry.key, entry.points);
  }
}

function applyStrategyScores(
  cardScores: Map<CheckinStrategyKey, number>,
  categoryScores: Map<CheckinStrategyCategoryKey, number>,
  strategyCategoryScores: readonly ScoreEntry<CheckinStrategyCategoryKey>[] | undefined,
  strategyScores: readonly ScoreEntry<CheckinStrategyKey>[] | undefined
) {
  if (strategyCategoryScores) {
    for (const entry of strategyCategoryScores) {
      increment(categoryScores, entry.key, entry.points);

      for (const card of AVAILABLE_STRATEGY_CARDS) {
        if (card.category === entry.key) {
          increment(cardScores, card.key, entry.points);
        }
      }
    }
  }

  if (strategyScores) {
    for (const entry of strategyScores) {
      if (!STRATEGY_CARD_ORDER.has(entry.key)) {
        continue;
      }

      increment(cardScores, entry.key, entry.points);
    }
  }
}

function pickSupportMessage(
  matchedRules: RecommendationRule[]
): string | undefined {
  const rankedMessage = matchedRules
    .filter((rule) => rule.supportMessage)
    .sort((left, right) => (right.supportWeight ?? 0) - (left.supportWeight ?? 0))[0];

  return rankedMessage?.supportMessage;
}

function rankToolKeys(toolScores: Map<string, number>, zoneKey: CheckinZoneKey | null): string[] {
  const ranked = AVAILABLE_TOOL_KEYS.slice().sort((left, right) => {
    const scoreDiff = (toolScores.get(right) ?? 0) - (toolScores.get(left) ?? 0);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return (
      (TOOL_TIE_BREAK_RANK.get(left) ?? Number.MAX_SAFE_INTEGER) -
      (TOOL_TIE_BREAK_RANK.get(right) ?? Number.MAX_SAFE_INTEGER)
    );
  });

  const positive = ranked.filter((toolKey) => (toolScores.get(toolKey) ?? 0) > 0);
  const fallback = zoneKey ? ZONE_TOOL_FALLBACKS[zoneKey].filter((toolKey) => !positive.includes(toolKey)) : [];

  return [...positive, ...fallback];
}

function rankStrategyIds(
  cardScores: Map<CheckinStrategyKey, number>,
  categoryScores: Map<CheckinStrategyCategoryKey, number>,
  zoneKey: CheckinZoneKey | null
): {
  strategyIds: CheckinStrategyKey[];
  categoryKeys: CheckinStrategyCategoryKey[];
} {
  const categoryKeys = Array.from(
    new Set(
      CHECKIN_STRATEGY_CARDS.map((card) => card.category)
    )
  ).sort((left, right) => (categoryScores.get(right) ?? 0) - (categoryScores.get(left) ?? 0));

  const rankedIds = AVAILABLE_STRATEGY_CARDS.slice().sort((left, right) => {
    const scoreDiff = (cardScores.get(right.key) ?? 0) - (cardScores.get(left.key) ?? 0);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    return (
      (STRATEGY_CARD_ORDER.get(left.key) ?? Number.MAX_SAFE_INTEGER) -
      (STRATEGY_CARD_ORDER.get(right.key) ?? Number.MAX_SAFE_INTEGER)
    );
  });

  const positiveIds = rankedIds
    .filter((card) => (cardScores.get(card.key) ?? 0) > 0)
    .map((card) => card.key);

  const fallbackIds = zoneKey
    ? ZONE_STRATEGY_FALLBACKS[zoneKey].filter(
        (strategyKey) =>
          STRATEGY_CARD_ORDER.has(strategyKey) && !positiveIds.includes(strategyKey)
      )
    : [];

  return {
    strategyIds: [...positiveIds, ...fallbackIds].slice(0, 5),
    categoryKeys: categoryKeys.filter((categoryKey) => (categoryScores.get(categoryKey) ?? 0) > 0),
  };
}

export function getCheckinRecommendations(
  input: CheckinRecommendationInput
): CheckinRecommendation {
  const context = createContext(input);
  const toolScores = new Map<string, number>();
  const strategyCardScores = new Map<CheckinStrategyKey, number>();
  const strategyCategoryScores = new Map<CheckinStrategyCategoryKey, number>();
  const matchedRules: RecommendationRule[] = [];

  for (const rule of RULES) {
    if (!rule.when(context)) {
      continue;
    }

    matchedRules.push(rule);
    applyToolScores(toolScores, rule.toolScores);
    applyStrategyScores(
      strategyCardScores,
      strategyCategoryScores,
      rule.strategyCategoryScores,
      rule.strategyScores
    );
  }

  const rankedToolKeys = rankToolKeys(toolScores, input.zoneKey);
  const toolRecommendations = rankedToolKeys
    .map((toolKey) => getToolByKey(toolKey, "toolkit"))
    .filter((tool): tool is ToolDefinition => Boolean(tool));

  const { strategyIds, categoryKeys } = rankStrategyIds(
    strategyCardScores,
    strategyCategoryScores,
    input.zoneKey
  );

  return {
    primaryTool: toolRecommendations[0] ?? null,
    alternateTools: toolRecommendations.slice(1, 4),
    recommendedStrategyIds: strategyIds,
    recommendedStrategyCategoryKeys: categoryKeys,
    supportMessage: pickSupportMessage(matchedRules),
  };
}

export function prioritizeSavedStrategies(
  strategyIds: readonly CheckinStrategyKey[],
  savedStrategyKeys: readonly CheckinStrategyKey[]
): CheckinStrategyKey[] {
  if (savedStrategyKeys.length < 1 || strategyIds.length < 1) {
    return [...strategyIds];
  }

  const savedSet = new Set(savedStrategyKeys);
  const savedMatches = strategyIds.filter((strategyKey) => savedSet.has(strategyKey));
  const remaining = strategyIds.filter((strategyKey) => !savedSet.has(strategyKey));

  return [...savedMatches, ...remaining];
}
