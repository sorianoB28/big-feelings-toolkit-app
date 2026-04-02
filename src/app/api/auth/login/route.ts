import { NextResponse } from "next/server";
import { verifyUserCredentials } from "@/db/users";

type LoginRequestBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: LoginRequestBody;

  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email.trim() || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const result = await verifyUserCredentials(email, password);

  if (result.error || !result.user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    user: {
      id: result.user.id,
      email: result.user.email,
    },
    session: {
      provider: "next-auth-credentials",
    },
  });
}
