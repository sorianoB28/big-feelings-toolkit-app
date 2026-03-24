import Link from "next/link";
import { redirect } from "next/navigation";
import { JourneyShell, type JourneySummaryChip } from "@/components/checkin/journey-shell";
import { getCheckinJourneySummary } from "@/db/queries/checkins";
import { getAccessibleStudentById } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";
import { toolCategoryIcons, toolIcons } from "@/lib/icons";
import { TOOL_REGISTRY, TOOL_CATEGORY_LABELS, type ToolDefinition } from "@/lib/tools/registry";

type CheckinToolsPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    checkinId?: string;
    zone?: string;
    intent?: string;
    themeKey?: string;
  };
};

const TOOL_CATEGORY_ORDER: ToolDefinition["category"][] = [
  "calm_body",
  "reset_mind",
  "release_energy",
  "get_support",
];

const RESET_INTENT_LABELS: Record<string, string> = {
  breathe: "Breathe",
  move: "Move",
  ground: "Ground",
  support: "Get Support",
};

function formatDurationLabel(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min`;
}

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default async function CheckinToolsPage({
  params,
  searchParams,
}: CheckinToolsPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    redirect("/students");
  }

  const checkinId = searchParams?.checkinId?.trim() ?? "";
  const intent = searchParams?.intent?.trim() ?? "";
  const themeKey = searchParams?.themeKey?.trim() || student.themeKey || "";
  if (!checkinId) {
    redirect(`/students/${student.id}/checkin/start`);
  }

  const checkinSummary = await getCheckinJourneySummary(checkinId);
  const zone = searchParams?.zone?.trim() || checkinSummary?.zone || "";
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

  const groupedTools = TOOL_CATEGORY_ORDER.map((category) => ({
    category,
    label: TOOL_CATEGORY_LABELS[category],
    tools: TOOL_REGISTRY.filter((tool) => tool.category === category),
  }));

  const finishParams = new URLSearchParams({
    checkinId,
  });

  if (zone) {
    finishParams.set("zone", zone);
  }
  if (intent) {
    finishParams.set("intent", intent);
  }

  return (
    <JourneyShell
      eyebrow="Check-in Journey"
      title="Choose a reset tool"
      description={`${student.displayName}, pick one tool to help your brain and body reset.`}
      progressLabel="Step 2 of 3"
      progressPercent={67}
      summaryChips={summaryChips}
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/students/${student.id}/checkin/start`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-surface px-5 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
          >
            Back
          </Link>
          <Link
            href={`/students/${student.id}/checkin/finish?${finishParams.toString()}`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gray-300 bg-surface px-5 py-2 text-sm font-medium text-dark shadow-sm transition duration-[250ms] ease-out hover:bg-gray-100"
          >
            Skip tool
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {groupedTools.map((group) => {
          const CategoryIcon = toolCategoryIcons[group.category];

          return (
            <div key={group.category}>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-gray-100 p-2 text-dark">
                  <CategoryIcon className="h-4 w-4" />
                </div>
                <h2 className="text-base font-semibold text-dark">{group.label}</h2>
                <div className="h-px flex-1 bg-primary/35" />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {group.tools.map((tool) => {
                  const ToolIcon =
                    toolIcons[tool.toolKey as keyof typeof toolIcons] ?? toolIcons.default;
                  const query = new URLSearchParams({
                    checkinId,
                    studentId: student.id,
                    from: "checkin",
                  });
                  if (zone) {
                    query.set("zone", zone);
                  }
                  if (intent) {
                    query.set("intent", intent);
                  }
                  if (themeKey) {
                    query.set("themeKey", themeKey);
                  }

                  const toolHref = `/tools/${tool.toolKey}?${query.toString()}`;

                  return (
                    <article
                      key={tool.toolKey}
                      className="flex h-full flex-col rounded-xl border border-border-soft bg-surface p-5 shadow-sm transition duration-[250ms] ease-out hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                        <ToolIcon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-3 text-base font-semibold text-dark">{tool.title}</h3>
                      <p className="mt-2 flex-1 text-sm text-gray-700">{tool.description}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-dark">
                          {formatDurationLabel(tool.durationSeconds)}
                        </span>
                        <Link
                          href={toolHref}
                          className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-[250ms] ease-out hover:bg-primary-dark"
                        >
                          Start
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </JourneyShell>
  );
}
