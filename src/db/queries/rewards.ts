import "server-only";

import { db } from "@/db";
import {
  BADGE_RULES,
  BREATHING_TOOL_KEYS,
  GROUNDING_TOOL_KEYS,
  getBadgeRuleCurrentValue,
  type BadgeProgressMetrics,
} from "@/lib/badges/rules";
import { BADGES } from "@/lib/student-options";

type TableCheckRow = {
  badges_table: string | null;
  student_badges_table: string | null;
};

type StudentBadgeRow = {
  badge_key: string;
  title: string;
  description: string;
  icon_key: string;
  tier: string | null;
  awarded_at: string;
};

type EarnedBadgeKeyRow = {
  badge_key: string;
};

type MetricsRow = {
  total_tool_completions: number | string;
  breathing_tool_completions: number | string;
  grounding_sessions: number | string;
  checkins_last_7_days: number | string;
};

export type StudentBadge = {
  key: string;
  title: string;
  description: string;
  iconKey: string;
  tier: string | null;
  awardedAt: string;
};

export type StudentRewardsProgress = {
  metrics: BadgeProgressMetrics;
  earnedBadgeKeys: string[];
  nextBadge: {
    key: string;
    title: string;
    description: string;
    current: number;
    target: number;
    progressLabel: string;
    progressPercent: number;
  } | null;
};

function parseCount(value: number | string): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapMetricsRow(row: MetricsRow): BadgeProgressMetrics {
  return {
    totalToolCompletions: parseCount(row.total_tool_completions),
    breathingToolCompletions: parseCount(row.breathing_tool_completions),
    groundingSessions: parseCount(row.grounding_sessions),
    checkinsLast7Days: parseCount(row.checkins_last_7_days),
  };
}

async function checkRewardsTables(): Promise<{ available: boolean }> {
  const tableCheckResult = await db.query<TableCheckRow>(
    `
      select
        to_regclass('public.badges')::text as badges_table,
        to_regclass('public.student_badges')::text as student_badges_table
    `
  );

  const row = tableCheckResult.rows[0];
  return { available: Boolean(row?.badges_table && row?.student_badges_table) };
}

export async function getStudentBadges(studentId: string): Promise<StudentBadge[]> {
  const trimmedStudentId = studentId.trim();
  if (!trimmedStudentId) {
    return [];
  }

  const { available } = await checkRewardsTables();
  if (!available) {
    return [];
  }

  const result = await db.query<StudentBadgeRow>(
    `
      select
        sb.badge_key,
        b.title,
        b.description,
        b.icon_key,
        b.tier,
        sb.awarded_at::text as awarded_at
      from student_badges sb
      inner join badges b on b.key = sb.badge_key
      where sb.student_id = $1
      order by sb.awarded_at desc
    `,
    [trimmedStudentId]
  );

  return result.rows.map((row) => ({
    key: row.badge_key,
    title: row.title,
    description: row.description,
    iconKey: row.icon_key,
    tier: row.tier,
    awardedAt: row.awarded_at,
  }));
}

export async function getStudentProgress(studentId: string): Promise<StudentRewardsProgress> {
  const trimmedStudentId = studentId.trim();
  if (!trimmedStudentId) {
    return {
      metrics: {
        totalToolCompletions: 0,
        breathingToolCompletions: 0,
        groundingSessions: 0,
        checkinsLast7Days: 0,
      },
      earnedBadgeKeys: [],
      nextBadge: null,
    };
  }

  const metricsResult = await db.query<MetricsRow>(
    `
      select
        (
          select count(*)
          from tool_uses tu
          inner join checkins c on c.id = tu.checkin_id
          where c.student_id = $1
        ) as total_tool_completions,
        (
          select count(*)
          from tool_uses tu
          inner join checkins c on c.id = tu.checkin_id
          where c.student_id = $1
            and tu.tool_key = any($2::text[])
        ) as breathing_tool_completions,
        (
          select count(distinct c.id)
          from checkins c
          inner join tool_uses tu on tu.checkin_id = c.id
          where c.student_id = $1
            and tu.tool_key = any($3::text[])
        ) as grounding_sessions,
        (
          select count(*)
          from checkins c
          where c.student_id = $1
            and c.started_at >= now() - interval '7 days'
        ) as checkins_last_7_days
    `,
    [trimmedStudentId, BREATHING_TOOL_KEYS, GROUNDING_TOOL_KEYS]
  );

  const metricsRow = metricsResult.rows[0];
  const metrics = metricsRow
    ? mapMetricsRow(metricsRow)
    : {
        totalToolCompletions: 0,
        breathingToolCompletions: 0,
        groundingSessions: 0,
        checkinsLast7Days: 0,
      };

  const { available } = await checkRewardsTables();
  let earnedBadgeKeys: string[] = [];

  if (available) {
    const earnedResult = await db.query<EarnedBadgeKeyRow>(
      `
        select badge_key
        from student_badges
        where student_id = $1
      `,
      [trimmedStudentId]
    );
    earnedBadgeKeys = earnedResult.rows.map((row) => row.badge_key);
  }

  const earnedSet = new Set(earnedBadgeKeys);
  const nextRule = BADGE_RULES.find((rule) => {
    if (earnedSet.has(rule.key)) {
      return false;
    }

    if (rule.isEarned(metrics)) {
      return false;
    }

    return getBadgeRuleCurrentValue(metrics, rule) < rule.target;
  });

  const badgeMetaByKey = new Map(BADGES.map((badge) => [badge.key, badge]));
  const nextBadgeMeta = nextRule ? badgeMetaByKey.get(nextRule.key) : null;

  const current = nextRule ? getBadgeRuleCurrentValue(metrics, nextRule) : 0;
  const target = nextRule?.target ?? 1;
  const clampedCurrent = Math.min(current, target);

  return {
    metrics,
    earnedBadgeKeys,
    nextBadge:
      nextRule && nextBadgeMeta
        ? {
            key: nextRule.key,
            title: nextBadgeMeta.title,
            description: nextBadgeMeta.description,
            current: clampedCurrent,
            target: nextRule.target,
            progressLabel: nextRule.progressLabel,
            progressPercent: Math.round((clampedCurrent / target) * 100),
          }
        : null,
  };
}

