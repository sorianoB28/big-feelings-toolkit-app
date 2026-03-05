import { StaffCheckinsTable } from "@/components/checkins/staff-checkins-table";
import { buttonSecondaryClass, inputBaseClass } from "@/components/ui/form-styles";
import { listRecentCheckins } from "@/db/queries/checkins";
import { getStaffScopeForUser } from "@/db/queries/staff";
import { requireUser } from "@/lib/auth/require-user";
import { CHECKIN_ZONES } from "@/lib/checkin-options";

type CheckinsPageProps = {
  searchParams?: {
    zone?: string;
    range?: string;
    active?: string;
  };
};

function normalizeZone(zone: string | undefined): string | null {
  const candidate = zone?.trim().toLowerCase() ?? "";
  if (!candidate) {
    return null;
  }

  return CHECKIN_ZONES.some((zoneOption) => zoneOption.id === candidate) ? candidate : null;
}

function normalizeRange(range: string | undefined): 7 | 30 {
  if (range === "30") {
    return 30;
  }

  return 7;
}

function getFromDateIso(days: 7 | 30): string {
  const from = new Date();
  from.setDate(from.getDate() - days);
  return from.toISOString();
}

export default async function CheckinsPage({ searchParams }: CheckinsPageProps) {
  const user = await requireUser();
  const staffScope = await getStaffScopeForUser(user.id);
  const zone = normalizeZone(searchParams?.zone);
  const rangeDays = normalizeRange(searchParams?.range);
  const activeOnly = searchParams?.active === "1";
  const fromDate = getFromDateIso(rangeDays);

  const checkins = await listRecentCheckins({
    schoolId: staffScope.schoolId,
    userRole: staffScope.role,
    teacherId: staffScope.role === "teacher" ? user.id : null,
    fromDate,
    zone,
    activeOnly,
  });

  return (
    <section className="app-card p-6 sm:p-8">
      <h1 className="tracking-tight">Check-ins</h1>
      <p className="mt-2 text-sm text-gray-700">Recent student check-ins for your staff scope.</p>

      <form className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-border-soft bg-slate-50 p-4">
        <div>
          <label htmlFor="zone" className="mb-1 block text-sm font-medium text-slate-700">
            Zone
          </label>
          <select id="zone" name="zone" defaultValue={zone ?? ""} className={inputBaseClass}>
            <option value="">All zones</option>
            {CHECKIN_ZONES.map((zoneOption) => (
              <option key={zoneOption.id} value={zoneOption.id}>
                {zoneOption.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="range" className="mb-1 block text-sm font-medium text-slate-700">
            Date range
          </label>
          <select
            id="range"
            name="range"
            defaultValue={String(rangeDays)}
            className={inputBaseClass}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </div>

        <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="active"
            value="1"
            defaultChecked={activeOnly}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
          />
          Show active only
        </label>

        <button type="submit" className={buttonSecondaryClass}>
          Apply
        </button>
      </form>

      <div className="mt-6">
        <StaffCheckinsTable checkins={checkins} />
      </div>
    </section>
  );
}
