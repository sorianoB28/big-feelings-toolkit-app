import "server-only";

import { Pool } from "pg";
import { env } from "@/lib/env";

declare global {
  // eslint-disable-next-line no-var
  var __dbPool: Pool | undefined;
}

const globalForDb = globalThis as typeof globalThis & {
  __dbPool?: Pool;
};

export const db =
  globalForDb.__dbPool ??
  new Pool({
    connectionString: env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__dbPool = db;
}
