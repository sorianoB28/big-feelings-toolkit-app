import { StudentForm } from "@/components/students/student-form";
import { listClassroomOptions } from "@/db/queries/students";
import { requireUser } from "@/lib/auth/require-user";
import { createStudentAction } from "../actions";

type NewStudentPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function NewStudentPage({ searchParams }: NewStudentPageProps) {
  const user = await requireUser();
  const classrooms = await listClassroomOptions({ actorUserId: user.id });
  const errorMessage = searchParams?.error;

  return (
    <StudentForm
      title="Create Student"
      description="Add a new student profile for staff tracking."
      action={createStudentAction}
      submitLabel="Create Student"
      cancelHref="/students"
      classrooms={classrooms}
      errorMessage={errorMessage}
    />
  );
}
