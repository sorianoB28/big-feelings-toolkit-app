export type BadgeProgressMetrics = {
  totalToolCompletions: number;
  breathingToolCompletions: number;
  groundingSessions: number;
  checkinsLast7Days: number;
};

export type BadgeMetricKey = keyof BadgeProgressMetrics;
export type BadgeRuleKey =
  | "reset_rookie"
  | "steady_starter"
  | "breathing_builder"
  | "grounding_great"
  | "consistency_king";

export type BadgeRule = {
  key: BadgeRuleKey;
  metricKey: BadgeMetricKey;
  target: number;
  progressLabel: string;
  description: string;
  isEarned: (metrics: BadgeProgressMetrics) => boolean;
};

export const BREATHING_TOOL_KEYS = [
  "box_breathing",
  "circle_breathing",
  "star_breathing",
  "bubble-breathing",
  "infinity_breathing",
] as const;

export const GROUNDING_TOOL_KEYS = [
  "54321-grounding",
  "grounding",
  "grounding_exercise",
] as const;

export const BADGE_RULES: BadgeRule[] = [
  {
    key: "reset_rookie",
    metricKey: "totalToolCompletions",
    target: 1,
    progressLabel: "tool completions",
    description: "Complete at least 1 tool.",
    isEarned: (metrics) => metrics.totalToolCompletions >= 1,
  },
  {
    key: "steady_starter",
    metricKey: "totalToolCompletions",
    target: 3,
    progressLabel: "tool completions",
    description: "Complete at least 3 tools.",
    isEarned: (metrics) => metrics.totalToolCompletions >= 3,
  },
  {
    key: "breathing_builder",
    metricKey: "breathingToolCompletions",
    target: 3,
    progressLabel: "breathing sessions",
    description: "Complete at least 3 breathing tools.",
    isEarned: (metrics) => metrics.breathingToolCompletions >= 3,
  },
  {
    key: "grounding_great",
    metricKey: "groundingSessions",
    target: 2,
    progressLabel: "grounding sessions",
    description: "Complete at least 2 grounding sessions.",
    isEarned: (metrics) => metrics.groundingSessions >= 2,
  },
  {
    key: "consistency_king",
    metricKey: "checkinsLast7Days",
    target: 3,
    progressLabel: "check-ins in 7 days",
    description: "Complete at least 3 check-ins in the last 7 days.",
    isEarned: (metrics) => metrics.checkinsLast7Days >= 3,
  },
] as const;

export function getBadgeRuleCurrentValue(
  metrics: BadgeProgressMetrics,
  rule: Pick<BadgeRule, "metricKey">
): number {
  return metrics[rule.metricKey];
}
