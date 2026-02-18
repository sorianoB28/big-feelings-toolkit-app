import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SignInForm } from "@/components/auth/sign-in-form";
import { countUsers } from "@/db/users";
import { authOptions } from "@/lib/auth/options";
import { getSignInErrorMessage } from "@/lib/auth/sign-in-errors";

type SignInPageProps = {
  searchParams?: {
    callbackUrl?: string;
    error?: string;
  };
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const [session, userCount] = await Promise.all([getServerSession(authOptions), countUsers()]);

  if (session?.user) {
    redirect("/dashboard");
  }

  const callbackUrl =
    typeof searchParams?.callbackUrl === "string" && searchParams.callbackUrl.length > 0
      ? searchParams.callbackUrl
      : "/dashboard";

  const errorMessage = getSignInErrorMessage(searchParams?.error);
  const showNoUsersMessage = userCount === 0;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Staff Sign In</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use your district staff account to access the toolkit.
        </p>
        {showNoUsersMessage ? (
          <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            No staff accounts found. Run the seed script or ask an admin to create your account.
          </p>
        ) : null}
        <div className="mt-6">
          <SignInForm callbackUrl={callbackUrl} initialError={errorMessage} />
        </div>
      </div>
    </section>
  );
}
