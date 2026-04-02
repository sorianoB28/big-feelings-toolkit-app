import "server-only";

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authEnv } from "@/lib/env";
import type { AppRole } from "@/types/auth";

export const authOptions: NextAuthOptions = {
  secret: authEnv.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  providers: [
    CredentialsProvider({
      name: "Email and Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim() ?? "";
        const password = credentials?.password ?? "";

        if (!email || !password) {
          throw new Error("invalid_credentials");
        }

        // Avoid loading the database module unless a credentials sign-in is actually attempted.
        const { verifyUserCredentials } = await import("@/db/users");
        const result = await verifyUserCredentials(email, password);

        if (result.error) {
          throw new Error(result.error);
        }

        return result.user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role as AppRole;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.userId === "string" ? token.userId : "";
        session.user.role =
          token.role === "teacher" || token.role === "sel_coach" || token.role === "admin"
            ? token.role
            : "teacher";
      }

      return session;
    },
  },
};
