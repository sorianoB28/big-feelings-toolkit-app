import type { StudentCheckinListItem } from "@/types/checkins";

type StudentCheckinsListProps = {
  checkins: StudentCheckinListItem[];
  emptyMessage: string;
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

  return { dotClass: "bg-slate-400", label: zone };
}

function truncateText(value: string | null, maxLength = 90): string {
  if (!value) {
    return "-";
  }
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}

export function StudentCheckinsList({ checkins, emptyMessage }: StudentCheckinsListProps) {
  if (checkins.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-base font-medium text-slate-800">No check-ins yet.</p>
        <p className="mt-1 text-sm text-slate-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {checkins.map((checkin) => {
        const zone = zoneStyles(checkin.zone);
        return (
          <li key={checkin.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-800">{formatDateTime(checkin.startedAt)}</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                <span className={`h-2.5 w-2.5 rounded-full ${zone.dotClass}`} aria-hidden="true" />
                {zone.label}
              </span>
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Feelings</p>
              <div className="mt-1 flex flex-wrap gap-2">
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

            <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-800">Tool:</span>{" "}
                {checkin.selectedToolLabel ?? "-"}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Intensity:</span>{" "}
                {checkin.intensity ?? "-"}
              </p>
            </div>

            <p className="mt-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-800">First step back:</span>{" "}
              {truncateText(checkin.returnToClassStep)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
