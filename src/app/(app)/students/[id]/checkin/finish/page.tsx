import { notFound, redirect } from "next/navigation";
import { CheckinFinishStep } from "@/components/checkins/checkin-finish-step";
import { getAccessibleStudentById } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";
import { closeStudentCheckinAction } from "./actions";

type CheckinFinishPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    checkinId?: string;
  };
};

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

  const action = closeStudentCheckinAction.bind(null, student.id, checkinId);

  return <CheckinFinishStep studentId={student.id} checkinId={checkinId} action={action} />;
}
