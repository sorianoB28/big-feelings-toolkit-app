import "server-only";

import { db } from "@/db";
import {
  BADGE_RULES,
  BREATHING_TOOL_KEYS,
  GROUNDING_TOOL_KEYS,
  getBadgeRuleCurrentValue,
  type BadgeProgressMetrics,
} from "@/lib/badges/rules";

type TableCheckRow = {
  badges_table: string | null;
  student_badges_table: string | null;
};

type MetricsRow = {
  total_tool_completions: number | string;
  breathing_tool_completions: number | string;
  grounding_sessions: number | string;
  checkins_last_7_days: number | string;
};

type AwardedRow = {
  badge_key: string;
};

function parseCount(value: number | string): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function toMetrics(row: MetricsRow): BadgeProgressMetrics {
  return {
    totalToolCompletions: parseCount(row.total_tool_completions),
    breathingToolCompletions: parseCount(row.breathing_tool_completions),
    groundingSessions: parseCount(row.grounding_sessions),
    checkinsLast7Days: parseCount(row.checkins_last_7_days),
  };
}

export async function awardBadgesForStudent(studentId: string): Promise<{
  awardedBadgeKeys: string[];
}> {
  const trimmedStudentId = studentId.trim();
  if (!trimmedStudentId) {
    return { awardedBadgeKeys: [] };
  }

  const tableCheckResult = await db.query<TableCheckRow>(
    `
      select
        to_regclass('public.badges')::text as badges_table,
        to_regclass('public.student_badges')::text as student_badges_table
    `
  );

  const tableCheck = tableCheckResult.rows[0];
  if (!tableCheck?.badges_table || !tableCheck?.student_badges_table) {
    return { awardedBadgeKeys: [] };
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
  if (!metricsRow) {
    return { awardedBadgeKeys: [] };
  }

  const metrics = toMetrics(metricsRow);
  const earnedBadgeKeys = BADGE_RULES.filter((rule) => {
    if (rule.isEarned(metrics)) {
      return true;
    }

    return getBadgeRuleCurrentValue(metrics, rule) >= rule.target;
  }).map((rule) => rule.key);

  if (earnedBadgeKeys.length < 1) {
    return { awardedBadgeKeys: [] };
  }

  const insertResult = await db.query<AwardedRow>(
    `
      insert into student_badges (student_id, badge_key)
      select $1, b.key
      from badges b
      where b.active = true
        and b.key = any($2::text[])
      on conflict (student_id, badge_key) do nothing
      returning badge_key
    `,
    [trimmedStudentId, earnedBadgeKeys]
  );

  return {
    awardedBadgeKeys: insertResult.rows.map((row) => row.badge_key),
  };
}
