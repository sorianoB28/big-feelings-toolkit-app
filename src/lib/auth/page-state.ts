import "server-only";

export function getAuthPageConfigError(): string | null {
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

export async function getExistingSessionSafely() {
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
    console.error("Failed to initialize auth session on the auth page.", error);

    return {
      sessionUser: null,
      authError: "Sign-in is temporarily unavailable. Please try again later.",
    };
  }
}
