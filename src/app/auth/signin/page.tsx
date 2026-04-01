import { redirect } from "next/navigation";
import Image from "next/image";
import { SignInForm } from "@/components/auth/sign-in-form";
import { BrandHeader } from "@/components/brand/brand-header";
import { GlassCard } from "@/components/ui/glass-card";
import { getSignInErrorMessage } from "@/lib/auth/sign-in-errors";

type SignInPageProps = {
  searchParams?: {
    callbackUrl?: string;
    error?: string;
  };
};

export const dynamic = "force-dynamic";

function getAuthPageConfigError(): string | null {
  const nextAuthSecret = process.env.NEXTAUTH_SECRET?.trim();
  const nextAuthUrl = process.env.NEXTAUTH_URL?.trim();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!nextAuthSecret || !nextAuthUrl || !databaseUrl) {
    return "Sign-in is temporarily unavailable. Please contact your administrator.";
  }

  try {
    new URL(nextAuthUrl);
  } catch {
    return "Sign-in is temporarily unavailable. Please contact your administrator.";
  }

  return null;
}

async function getExistingSessionSafely() {
  const configError = getAuthPageConfigError();

  if (configError) {
    return {
      sessionUser: null,
      authError: configError,
    };
  }

  try {
    const [{ getServerSession }, { authOptions }] = await Promise.all([
      import("next-auth"),
      import("@/lib/auth/options"),
    ]);
    const session = await getServerSession(authOptions);

    return {
      sessionUser: session?.user ?? null,
      authError: null,
    };
  } catch (error) {
    console.error("Failed to initialize auth session on the sign-in page.", error);

    return {
      sessionUser: null,
      authError: "Sign-in is temporarily unavailable. Please try again later.",
    };
  }
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { sessionUser, authError } = await getExistingSessionSafely();

  if (sessionUser) {
    redirect("/dashboard");
  }

  const callbackUrl =
    typeof searchParams?.callbackUrl === "string" && searchParams.callbackUrl.length > 0
      ? searchParams.callbackUrl
      : "/dashboard";

  const errorMessage = getSignInErrorMessage(searchParams?.error);
  const isFormDisabled = Boolean(authError);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/background.png"
          alt="Oakestown Intermediate"
          fill
          priority
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-primary/10" />

      <div className="relative z-10 flex min-h-screen items-center justify-end px-8 lg:px-20">
        <div className="hidden flex-1 pr-12 lg:block">
          <div className="max-w-xl rounded-2xl border border-white/35 bg-white/84 p-6 shadow-lg backdrop-blur-sm">
            <BrandHeader variant="auth" showSchoolBadge />
            <p className="mt-4 text-sm leading-6 text-gray-700">
              Use your staff account to access check-ins and tools.
            </p>
          </div>
        </div>

        <GlassCard variant="solid" className="w-full max-w-md rounded-2xl bg-white/95 p-8 shadow-xl backdrop-blur">
          <BrandHeader variant="compact" />
          <h1 className="mt-5 tracking-tight">Staff Sign In</h1>
          <p className="mt-2 text-sm text-gray-700">Use your district credentials to continue.</p>
          {authError ? (
            <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {authError}
            </p>
          ) : null}
          <div className="mt-6">
            <SignInForm
              callbackUrl={callbackUrl}
              initialError={errorMessage}
              disabled={isFormDisabled}
              disabledReason={authError ?? undefined}
            />
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
