import { notFound, redirect } from "next/navigation";
import { type JourneySummaryChip } from "@/components/checkin/journey-shell";
import { CheckinFinishStep } from "@/components/checkins/checkin-finish-step";
import { getCheckinJourneySummary } from "@/db/queries/checkins";
import { getAccessibleStudentById } from "@/db/queries/students";
import { getLatestToolUseRecapForCheckin } from "@/db/queries/tool-uses";
import { requireUser } from "@/lib/auth/require-user";
import { closeStudentCheckinAction } from "./actions";

type CheckinFinishPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    checkinId?: string;
    zone?: string;
    intent?: string;
  };
};

const RESET_INTENT_LABELS: Record<string, string> = {
  breathe: "Breathe",
  move: "Move",
  ground: "Ground",
  support: "Get Support",
};

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default async function CheckinFinishPage({
  params,
  searchParams,
}: CheckinFinishPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    notFound();
  }

  const checkinId = searchParams?.checkinId?.trim() ?? "";
  if (!checkinId) {
    redirect(`/students/${student.id}/checkin/start`);
  }

  const [checkinSummary, toolRecap] = await Promise.all([
    getCheckinJourneySummary(checkinId),
    getLatestToolUseRecapForCheckin(checkinId),
  ]);
  const zone = searchParams?.zone?.trim() || checkinSummary?.zone || "";
  const intent = searchParams?.intent?.trim() ?? "";
  const action = closeStudentCheckinAction.bind(null, student.id, checkinId);
  const backParams = new URLSearchParams({ checkinId });

  if (zone) {
    backParams.set("zone", zone);
  }
  if (intent) {
    backParams.set("intent", intent);
  }

  const summaryChips: JourneySummaryChip[] = [];
  if (zone) {
    summaryChips.push({ label: "Zone", value: toTitleCase(zone) });
  }
  if (checkinSummary?.feelingWords.length) {
    summaryChips.push({
      label: "Vibes",
      value: checkinSummary.feelingWords.join(", "),
    });
  }
  if (intent && RESET_INTENT_LABELS[intent]) {
    summaryChips.push({
      label: "Reset",
      value: RESET_INTENT_LABELS[intent],
    });
  }

  return (
    <CheckinFinishStep
      studentId={student.id}
      action={action}
      backHref={`/students/${student.id}/checkin/tools?${backParams.toString()}`}
      summaryChips={summaryChips}
      recap={{
        zoneLabel: zone ? toTitleCase(zone) : null,
        toolLabel: toolRecap?.toolLabel ?? null,
        helpfulnessRating: toolRecap?.helpfulRating ?? null,
        toolWasSkipped: toolRecap?.wasSkipped ?? false,
        toolProgressPercent: toolRecap?.progressPercent ?? null,
      }}
    />
  );
}
