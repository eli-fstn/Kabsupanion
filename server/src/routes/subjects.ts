import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { subjects, schedules, tasks, dayOfWeek } from "../db/schema";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const subjectRoutes = new Hono<AppEnv>();

subjectRoutes.use("*", requireAuth);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TIME_RE = /^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/i;
const DAYS = dayOfWeek.enumValues;

// GET /subjects — all subjects with their schedule slots nested.
subjectRoutes.get("/", async (c) => {
  const db = createDb(c.env.DATABASE_URL);

  const rows = await db
    .select({ subject: subjects, schedule: schedules })
    .from(subjects)
    .leftJoin(schedules, eq(schedules.subjectId, subjects.id))
    .orderBy(subjects.code);

  const map = new Map<string, typeof subjects.$inferSelect & { schedules: typeof schedules.$inferSelect[] }>();
  for (const row of rows) {
    if (!map.has(row.subject.id)) {
      map.set(row.subject.id, { ...row.subject, schedules: [] });
    }
    if (row.schedule) {
      map.get(row.subject.id)!.schedules.push(row.schedule);
    }
  }

  return c.json([...map.values()]);
});

// POST /subjects — create a subject. Admin only.
subjectRoutes.post("/", requireAdmin, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { code, name, description } = (body ?? {}) as {
    code?: unknown;
    name?: unknown;
    description?: unknown;
  };

  if (typeof code !== "string" || code.trim() === "") {
    return c.json({ error: "`code` is required and must be a non-empty string" }, 400);
  }
  if (typeof name !== "string" || name.trim() === "") {
    return c.json({ error: "`name` is required and must be a non-empty string" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const [existing] = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.code, code.trim().toUpperCase()))
    .limit(1);
  if (existing) {
    return c.json({ error: "A subject with that code already exists" }, 409);
  }

  const [created] = await db
    .insert(subjects)
    .values({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      description: typeof description === "string" ? description.trim() : null,
    })
    .returning();

  return c.json(created, 201);
});

// PATCH /subjects/:id — update a subject. Admin only.
subjectRoutes.patch("/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  if (!UUID_RE.test(id)) {
    return c.json({ error: "Invalid subject id" }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { code, name, description } = (body ?? {}) as {
    code?: unknown;
    name?: unknown;
    description?: unknown;
  };

  const patch: { code?: string; name?: string; description?: string | null; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (code !== undefined) {
    if (typeof code !== "string" || code.trim() === "") {
      return c.json({ error: "`code` must be a non-empty string" }, 400);
    }
    patch.code = code.trim().toUpperCase();
  }
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return c.json({ error: "`name` must be a non-empty string" }, 400);
    }
    patch.name = name.trim();
  }
  if (description !== undefined) {
    patch.description = typeof description === "string" ? description.trim() : null;
  }

  if (Object.keys(patch).length === 1) {
    return c.json({ error: "At least one field must be provided" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [updated] = await db
    .update(subjects)
    .set(patch)
    .where(eq(subjects.id, id))
    .returning();

  if (!updated) {
    return c.json({ error: "Subject not found" }, 404);
  }

  return c.json(updated);
});

// DELETE /subjects/:id — delete a subject (cascades to schedules + tasks). Admin only.
subjectRoutes.delete("/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  if (!UUID_RE.test(id)) {
    return c.json({ error: "Invalid subject id" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [deleted] = await db
    .delete(subjects)
    .where(eq(subjects.id, id))
    .returning({ id: subjects.id });

  if (!deleted) {
    return c.json({ error: "Subject not found" }, 404);
  }

  return c.json({ id: deleted.id, deleted: true });
});

// POST /subjects/:id/schedules — add a timetable slot. Admin only.
subjectRoutes.post("/:id/schedules", requireAdmin, async (c) => {
  const subjectId = c.req.param("id");
  if (!UUID_RE.test(subjectId)) {
    return c.json({ error: "Invalid subject id" }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { day, startTime, endTime, room } = (body ?? {}) as {
    day?: unknown;
    startTime?: unknown;
    endTime?: unknown;
    room?: unknown;
  };

  if (!DAYS.includes(day as typeof DAYS[number])) {
    return c.json({ error: `\`day\` must be one of: ${DAYS.join(", ")}` }, 400);
  }
  if (typeof startTime !== "string" || !TIME_RE.test(startTime)) {
    return c.json({ error: "`startTime` must be a 12-hour time string (e.g. \"8:00 AM\")" }, 400);
  }
  if (typeof endTime !== "string" || !TIME_RE.test(endTime)) {
    return c.json({ error: "`endTime` must be a 12-hour time string (e.g. \"10:00 AM\")" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const [subject] = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.id, subjectId))
    .limit(1);
  if (!subject) {
    return c.json({ error: "Subject not found" }, 404);
  }

  const [created] = await db
    .insert(schedules)
    .values({
      subjectId,
      day: day as typeof DAYS[number],
      startTime,
      endTime,
      room: typeof room === "string" ? room.trim() : null,
    })
    .returning();

  return c.json(created, 201);
});

// PATCH /subjects/:id/schedules/:scheduleId — update a timetable slot. Admin only.
subjectRoutes.patch("/:id/schedules/:scheduleId", requireAdmin, async (c) => {
  const subjectId = c.req.param("id");
  const scheduleId = c.req.param("scheduleId");
  if (!UUID_RE.test(subjectId) || !UUID_RE.test(scheduleId)) {
    return c.json({ error: "Invalid id" }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { day, startTime, endTime, room } = (body ?? {}) as {
    day?: unknown;
    startTime?: unknown;
    endTime?: unknown;
    room?: unknown;
  };

  const patch: { day?: typeof DAYS[number]; startTime?: string; endTime?: string; room?: string | null } = {};

  if (day !== undefined) {
    if (!DAYS.includes(day as typeof DAYS[number])) {
      return c.json({ error: `\`day\` must be one of: ${DAYS.join(", ")}` }, 400);
    }
    patch.day = day as typeof DAYS[number];
  }
  if (startTime !== undefined) {
    if (typeof startTime !== "string" || !TIME_RE.test(startTime)) {
      return c.json({ error: "`startTime` must be a 12-hour time string (e.g. \"8:00 AM\")" }, 400);
    }
    patch.startTime = startTime;
  }
  if (endTime !== undefined) {
    if (typeof endTime !== "string" || !TIME_RE.test(endTime)) {
      return c.json({ error: "`endTime` must be a 12-hour time string (e.g. \"10:00 AM\")" }, 400);
    }
    patch.endTime = endTime;
  }
  if (room !== undefined) {
    patch.room = typeof room === "string" ? room.trim() : null;
  }

  if (Object.keys(patch).length === 0) {
    return c.json({ error: "At least one field must be provided" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [updated] = await db
    .update(schedules)
    .set(patch)
    .where(and(eq(schedules.id, scheduleId), eq(schedules.subjectId, subjectId)))
    .returning();

  if (!updated) {
    return c.json({ error: "Schedule slot not found" }, 404);
  }

  return c.json(updated);
});

// DELETE /subjects/:id/schedules/:scheduleId — remove a timetable slot. Admin only.
subjectRoutes.delete("/:id/schedules/:scheduleId", requireAdmin, async (c) => {
  const subjectId = c.req.param("id");
  const scheduleId = c.req.param("scheduleId");
  if (!UUID_RE.test(subjectId) || !UUID_RE.test(scheduleId)) {
    return c.json({ error: "Invalid id" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [deleted] = await db
    .delete(schedules)
    .where(and(eq(schedules.id, scheduleId), eq(schedules.subjectId, subjectId)))
    .returning({ id: schedules.id });

  if (!deleted) {
    return c.json({ error: "Schedule slot not found" }, 404);
  }

  return c.json({ id: deleted.id, deleted: true });
});
