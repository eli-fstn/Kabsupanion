import { inArray, isNotNull } from "drizzle-orm";
import { createDb } from "../db/client";
import { tasks } from "../db/schema";
import type { Env } from "../types";

const PH_OFFSET_MS = 8 * 60 * 60 * 1000; // Asia/Manila is UTC+8 year-round, no DST

// The end of dueDate's calendar day, evaluated in Manila local time, expressed
// as the correct UTC instant. E.g. 2026-07-17 14:00 UTC+8 -> 2026-07-17 23:59:59.999 UTC+8.
function endOfDueDateManila(dueDate: Date): Date {
  const manilaWallClock = new Date(dueDate.getTime() + PH_OFFSET_MS);
  manilaWallClock.setUTCHours(23, 59, 59, 999);
  return new Date(manilaWallClock.getTime() - PH_OFFSET_MS);
}

// Deletes every task whose due-date day (Manila time) has fully elapsed.
// task_completions cascade-delete automatically via the FK (onDelete: "cascade").
// Tasks with no dueDate are never touched (nothing to trigger on).
export async function purgeOverdueTasks(env: Env): Promise<number> {
  const db = createDb(env.DATABASE_URL);

  // Fetch candidates first (need dueDate in JS to compute the per-row Manila
  // cutoff) rather than a single SQL WHERE — Postgres' date_trunc would need
  // an explicit `AT TIME ZONE 'Asia/Manila'` and this keeps the timezone
  // logic in one place, easier to unit-test than embedding it in SQL.
  const candidates = await db
    .select({ id: tasks.id, dueDate: tasks.dueDate })
    .from(tasks)
    .where(isNotNull(tasks.dueDate));

  const now = new Date();
  const overdueIds = candidates
    .filter((t) => endOfDueDateManila(t.dueDate!) <= now)
    .map((t) => t.id);

  if (overdueIds.length === 0) return 0;

  const deleted = await db
    .delete(tasks)
    .where(inArray(tasks.id, overdueIds))
    .returning({ id: tasks.id });
  return deleted.length;
}
