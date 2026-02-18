import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth/options";
import type { AppRole, AuthenticatedUser } from "@/types/auth";

export class AuthAccessError extends Error {
  code: "unauthorized" | "forbidden";

  constructor(code: "unauthorized" | "forbidden") {
    super(code === "unauthorized" ? "Unauthorized" : "Forbidden");
    this.code = code;
  }
}

type RequireUserOptions = {
  roles?: AppRole[];
  redirectTo?: string;
  onUnauthorized?: "redirect" | "throw";
};

export async function requireUser(options: RequireUserOptions = {}): Promise<AuthenticatedUser> {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user;
  const redirectTo = options.redirectTo ?? "/auth/signin";
  const onUnauthorized = options.onUnauthorized ?? "redirect";

  const fail = (): never => {
    if (onUnauthorized === "throw") {
      throw new AuthAccessError("unauthorized");
    }

    redirect(redirectTo);
  };

  if (!sessionUser?.id || !sessionUser.email || !sessionUser.role) {
    fail();
  }

  const safeUser = sessionUser as {
    id: string;
    email: string;
    name?: string | null;
    role: AppRole;
  };

  const user: AuthenticatedUser = {
    id: safeUser.id,
    email: safeUser.email,
    name: safeUser.name ?? null,
    role: safeUser.role,
  };

  if (options.roles && !options.roles.includes(user.role)) {
    if (onUnauthorized === "throw") {
      throw new AuthAccessError("forbidden");
    }

    redirect("/dashboard");
  }

  return user;
}
