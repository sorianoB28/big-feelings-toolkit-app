import { NotAuthorized } from "@/components/auth/not-authorized";
import { StaffForm } from "@/components/staff/staff-form";
import { FlashToast } from "@/components/ui/flash-toast";
import { AuthAccessError, requireUser } from "@/lib/auth/require-user";
import { createStaffUserAction } from "../actions";

type NewStaffPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function NewStaffPage({ searchParams }: NewStaffPageProps) {
  try {
    await requireUser({ roles: ["admin"], onUnauthorized: "throw" });

    return (
      <>
        {searchParams?.error ? <FlashToast message={searchParams.error} tone="error" /> : null}
        <StaffForm action={createStaffUserAction} errorMessage={searchParams?.error} />
      </>
    );
  } catch (error) {
    if (error instanceof AuthAccessError && error.code === "forbidden") {
      return <NotAuthorized message="Only admins can create staff accounts." />;
    }

    throw error;
  }
}
