import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { createProfileForUser } from "@/db/queries/profiles";
import { AVATARS } from "@/lib/student-options";

type CreateProfileRequestBody = {
  name?: unknown;
  avatar?: unknown;
};

const validAvatarKeys = new Set<string>(AVATARS.map((avatar) => avatar.key));

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: CreateProfileRequestBody;

  try {
    body = (await request.json()) as CreateProfileRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const avatar =
    typeof body.avatar === "string" && validAvatarKeys.has(body.avatar) ? body.avatar : null;

  if (!name) {
    return NextResponse.json({ error: "Enter a profile name." }, { status: 400 });
  }

  if (name.length > 80) {
    return NextResponse.json(
      { error: "Use 80 characters or fewer for the profile name." },
      { status: 400 }
    );
  }

  try {
    const profile = await createProfileForUser({
      userId,
      name,
      avatar,
    });

    return NextResponse.json({ ok: true, profile }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create profile." }, { status: 500 });
  }
}
