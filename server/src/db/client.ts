import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Build a fresh client per request. The Neon HTTP driver is connectionless
// (it uses `fetch`), so there is no long-lived pool to reuse on Workers.
export function createDb(databaseUrl: string) {
  return drizzle(neon(databaseUrl), { schema });
}

export type Db = ReturnType<typeof createDb>;
