import { NextResponse } from "next/server";
import { AuthValidationError, createUserAccount } from "@/db/users";

type SignupRequestBody = {
  email?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: SignupRequestBody;

  try {
    body = (await request.json()) as SignupRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email.trim() || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  try {
    const user = await createUserAccount({ email, password });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AuthValidationError) {
      const status = error.code === "email_taken" ? 409 : 400;
      return NextResponse.json({ error: error.message, code: error.code }, { status });
    }

    return NextResponse.json({ error: "Unable to create account." }, { status: 500 });
  }
}
