import { NextResponse } from "next/server";
import { db } from "@/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await db.query<{ ok: number }>("select 1 as ok");
    const isHealthy = result.rows[0]?.ok === 1;

    return NextResponse.json(
      {
        status: isHealthy ? "ok" : "error",
        database: isHealthy ? "connected" : "unexpected-result",
      },
      { status: isHealthy ? 200 : 500 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";

    return NextResponse.json(
      {
        status: "error",
        database: "unreachable",
        message: process.env.NODE_ENV === "development" ? message : "Database health check failed",
      },
      { status: 500 }
    );
  }
}
