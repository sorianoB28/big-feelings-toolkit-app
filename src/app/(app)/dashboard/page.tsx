import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { PageTransition } from "@/components/animations/page-transition";
import { getDashboardCheckinStats } from "@/db/queries/checkins";
import { getStaffScopeForUser, listStaffBySchool } from "@/db/queries/staff";
import { listAccessibleStudents } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";

async function getStaffMembersCount(actorUserId: string): Promise<number> {
  try {
    const scope = await getStaffScopeForUser(actorUserId);
    const staff = await listStaffBySchool(scope.schoolId);
    return staff.length;
  } catch {
    return 0;
  }
}

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = user.name?.trim() || user.email;
  const students = await listAccessibleStudents({
    actorUserId: user.id,
  });

  const studentIds = students.map((student) => student.id);
  const [checkinStats, staffMembers] = await Promise.all([
    getDashboardCheckinStats({ studentIds }),
    getStaffMembersCount(user.id),
  ]);

  return (
    <PageTransition>
      <DashboardOverview
        displayName={displayName}
        stats={{
          students: students.length,
          activeCheckins: checkinStats.activeCheckins,
          toolsUsedToday: checkinStats.toolsUsedToday,
          staffMembers,
        }}
      />
    </PageTransition>
  );
}
