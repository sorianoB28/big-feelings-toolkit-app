import type { StudentCheckinHistoryItem } from "@/types/checkins";

type StudentCheckinHistoryTimelineProps = {
  checkins: StudentCheckinHistoryItem[];
};

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return dateTimeFormatter.format(date);
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function zoneStyles(zone: string): { dotClass: string; label: string } {
  const normalized = zone.toLowerCase();
  if (normalized === "green") {
    return { dotClass: "bg-emerald-500", label: "Green" };
  }
  if (normalized === "yellow") {
    return { dotClass: "bg-amber-400", label: "Yellow" };
  }
  if (normalized === "blue") {
    return { dotClass: "bg-blue-500", label: "Blue" };
  }
  if (normalized === "red") {
    return { dotClass: "bg-rose-500", label: "Red" };
  }

  return { dotClass: "bg-slate-400", label: capitalize(zone) };
}

function formatSessionDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) {
    return "In progress";
  }

  const start = new Date(startedAt);
  const end = new Date(endedAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "-";
  }

  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "<1 min";
  }

  return `${diffMinutes} min`;
}

function toDisplayCategory(category: string): string {
  return category.replace(/_/g, " ");
}

export function StudentCheckinHistoryTimeline({ checkins }: StudentCheckinHistoryTimelineProps) {
  if (checkins.length < 1) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-base font-medium text-slate-800">No check-ins yet.</p>
        <p className="mt-1 text-sm text-slate-600">
          Start a check-in to build this student&apos;s timeline.
        </p>
      </div>
    );
  }

  return (
    <ul className="relative space-y-4 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-px before:bg-slate-200">
      {checkins.map((checkin) => {
        const zone = zoneStyles(checkin.zone);
        const toolLabel = checkin.toolUses[0]?.toolLabel ?? "No tool recorded";
        const duration = formatSessionDuration(checkin.startedAt, checkin.endedAt);

        return (
          <li key={checkin.id} className="relative pl-8">
            <span
              aria-hidden="true"
              className={`absolute left-0 top-3 h-6 w-6 rounded-full border-4 border-white shadow-sm ${zone.dotClass}`}
            />
            <details className="rounded-xl border border-border-soft bg-white p-4 shadow-sm">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-dark">
                      {zone.label} zone • {duration} • Tool: {toolLabel}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                      Started {formatDateTime(checkin.startedAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {checkin.endedAt ? "Completed" : "Active"}
                  </span>
                </div>
              </summary>

              <div className="mt-4 grid gap-4 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Zone & Intensity</p>
                  <p className="mt-1 text-dark">
                    {zone.label}
                    {checkin.intensity !== null ? `, intensity ${checkin.intensity}/10` : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ended</p>
                  <p className="mt-1 text-dark">
                    {checkin.endedAt ? formatDateTime(checkin.endedAt) : "Still active"}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Feelings</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {checkin.feelingWords.length > 0 ? (
                    checkin.feelingWords.map((feeling) => (
                      <span
                        key={`${checkin.id}-${feeling}`}
                        className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700"
                      >
                        {feeling}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">-</span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Body clues</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {checkin.bodyClues.length > 0 ? (
                    checkin.bodyClues.map((clue, index) => (
                      <span
                        key={`${checkin.id}-${clue.category}-${clue.symptom}-${index}`}
                        className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
                      >
                        {toDisplayCategory(clue.category)}: {clue.symptom}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">-</span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tools used</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {checkin.toolUses.length > 0 ? (
                    checkin.toolUses.map((tool, index) => (
                      <span
                        key={`${checkin.id}-${tool.toolKey}-${index}`}
                        className="rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-xs font-medium text-primary-dark"
                      >
                        {tool.toolLabel}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">-</span>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">First step back</p>
                <p className="mt-1 text-sm text-dark">{checkin.returnToClassStep ?? "-"}</p>
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

