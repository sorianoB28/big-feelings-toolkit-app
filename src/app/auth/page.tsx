import { redirect } from "next/navigation";
import { AuthExperience } from "@/components/auth/auth-experience";
import { getSafeCallbackUrl } from "@/lib/auth/redirects";
import { getExistingSessionSafely } from "@/lib/auth/page-state";
import { getSignInErrorMessage } from "@/lib/auth/sign-in-errors";

type AuthPageProps = {
  searchParams?: {
    callbackUrl?: string;
    error?: string;
    mode?: string;
  };
};

export const dynamic = "force-dynamic";

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { sessionUser, authError } = await getExistingSessionSafely();

  if (sessionUser) {
    redirect("/dashboard");
  }

  const callbackUrl = getSafeCallbackUrl(
    typeof searchParams?.callbackUrl === "string" ? searchParams.callbackUrl : null
  );

  return (
    <AuthExperience
      callbackUrl={callbackUrl}
      initialError={getSignInErrorMessage(searchParams?.error)}
      disabled={Boolean(authError)}
      disabledReason={authError ?? undefined}
      initialMode={searchParams?.mode === "create" ? "create" : "signin"}
    />
  );
}
