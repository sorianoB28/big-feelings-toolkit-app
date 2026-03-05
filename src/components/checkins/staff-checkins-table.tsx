"use client";

import { useRouter } from "next/navigation";
import type { StaffRecentCheckinItem } from "@/types/checkins";

type StaffCheckinsTableProps = {
  checkins: StaffRecentCheckinItem[];
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

function formatDuration(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt);
  const end = endedAt ? new Date(endedAt) : new Date();
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "-";
  }

  const minutes = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000));
  if (minutes < 1) {
    return "<1 min";
  }

  return `${minutes} min`;
}

function zoneBadgeClass(zone: string): string {
  switch (zone.toLowerCase()) {
    case "green":
      return "bg-emerald-100 text-emerald-800";
    case "yellow":
      return "bg-amber-100 text-amber-800";
    case "blue":
      return "bg-blue-100 text-blue-800";
    case "red":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function StaffCheckinsTable({ checkins }: StaffCheckinsTableProps) {
  const router = useRouter();

  if (checkins.length < 1) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-base font-medium text-slate-800">No check-ins found.</p>
        <p className="mt-1 text-sm text-slate-600">Try a different filter range.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-soft bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3">Date/time</th>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Zone</th>
            <th className="px-4 py-3">Tool used</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Return step</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {checkins.map((checkin) => (
            <tr
              key={checkin.id}
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/students/${checkin.studentId}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(`/students/${checkin.studentId}`);
                }
              }}
              className="cursor-pointer transition duration-[250ms] ease-out hover:bg-slate-50 focus-visible:bg-slate-50"
            >
              <td className="px-4 py-3">{formatDateTime(checkin.startedAt)}</td>
              <td className="px-4 py-3 font-medium text-dark">{checkin.studentName}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${zoneBadgeClass(checkin.zone)}`}>
                  {titleCase(checkin.zone)}
                </span>
              </td>
              <td className="px-4 py-3">{checkin.selectedToolLabel ?? "-"}</td>
              <td className="px-4 py-3">{formatDuration(checkin.startedAt, checkin.endedAt)}</td>
              <td className="px-4 py-3">{checkin.returnToClassStep ?? "-"}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    checkin.status === "active"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {checkin.status === "active" ? "Active" : "Closed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
