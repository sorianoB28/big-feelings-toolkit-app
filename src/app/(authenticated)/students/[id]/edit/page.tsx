import { notFound } from "next/navigation";
import { StudentForm } from "@/components/students/student-form";
import { getAccessibleStudentById, listClassroomOptions } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";
import { updateStudentAction } from "../../actions";

type EditStudentPageProps = {
  params: {
    id: string;
  };
  searchParams?: {
    error?: string;
  };
};

export default async function EditStudentPage({ params, searchParams }: EditStudentPageProps) {
  const user = await requireUser();
  const student = await getAccessibleStudentById({
    actorUserId: user.id,
    studentId: params.id,
  });

  if (!student) {
    notFound();
  }

  const classrooms = await listClassroomOptions({ actorUserId: user.id });
  const action = updateStudentAction.bind(null, params.id);

  return (
    <StudentForm
      title={`Edit ${student.displayName}`}
      description="Update student profile details."
      action={action}
      submitLabel="Save Changes"
      cancelHref={`/students/${student.id}`}
      classrooms={classrooms}
      defaults={student}
      errorMessage={searchParams?.error}
    />
  );
}
