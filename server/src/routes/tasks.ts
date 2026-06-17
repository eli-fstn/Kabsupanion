import { Hono } from "hono";
import { and, desc, eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { tasks, taskCompletions } from "../db/schema";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const taskRoutes = new Hono<AppEnv>();

// All task routes require a valid Bearer token.
taskRoutes.use("*", requireAuth);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /tasks — all (communal) tasks, newest first, each annotated with whether
// the CURRENT user has completed it. Completion is per-user, so the same task
// can read `completed: true` for one student and `false` for another.
taskRoutes.get("/", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const userId = c.get("user").id;

  const rows = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      dueDate: tasks.dueDate,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
      completedAt: taskCompletions.completedAt,
    })
    .from(tasks)
    .leftJoin(
      taskCompletions,
      and(
        eq(taskCompletions.taskId, tasks.id),
        eq(taskCompletions.userId, userId)
      )
    )
    .orderBy(desc(tasks.createdAt));

  const result = rows.map(({ completedAt, ...task }) => ({
    ...task,
    completed: completedAt !== null,
    completedAt,
  }));
  return c.json(result);
});

// POST /tasks — create a (communal) task. Admin only.
taskRoutes.post("/", requireAdmin, async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { title, description, dueDate } = (body ?? {}) as {
    title?: unknown;
    description?: unknown;
    dueDate?: unknown;
  };

  if (typeof title !== "string" || title.trim() === "") {
    return c.json(
      { error: "`title` is required and must be a non-empty string" },
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const [created] = await db
    .insert(tasks)
    .values({
      title: title.trim(),
      description: typeof description === "string" ? description : null,
      dueDate: typeof dueDate === "string" ? new Date(dueDate) : null,
    })
    .returning();

  return c.json(created, 201);
});

// PATCH /tasks/:id — update a task's fields (admin only). All fields optional;
// at least one must be provided.
taskRoutes.patch("/:id", requireAdmin, async (c) => {
  const taskId = c.req.param("id");
  if (!UUID_RE.test(taskId)) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { title, description, dueDate } = (body ?? {}) as {
    title?: unknown;
    description?: unknown;
    dueDate?: unknown;
  };

  const patch: { title?: string; description?: string | null; dueDate?: Date | null; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return c.json({ error: "`title` must be a non-empty string" }, 400);
    }
    patch.title = title.trim();
  }
  if (description !== undefined) {
    patch.description = typeof description === "string" ? description : null;
  }
  if (dueDate !== undefined) {
    patch.dueDate = typeof dueDate === "string" ? new Date(dueDate) : null;
  }

  if (Object.keys(patch).length === 1) {
    return c.json({ error: "At least one field must be provided" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [updated] = await db
    .update(tasks)
    .set(patch)
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json(updated);
});

// DELETE /tasks/:id — delete a task and all its completions (admin only).
taskRoutes.delete("/:id", requireAdmin, async (c) => {
  const taskId = c.req.param("id");
  if (!UUID_RE.test(taskId)) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [deleted] = await db
    .delete(tasks)
    .where(eq(tasks.id, taskId))
    .returning({ id: tasks.id });

  if (!deleted) {
    return c.json({ error: "Task not found" }, 404);
  }

  return c.json({ id: deleted.id, deleted: true });
});

// POST /tasks/:id/complete — mark a task done for the current user (idempotent).
taskRoutes.post("/:id/complete", async (c) => {
  const taskId = c.req.param("id");
  if (!UUID_RE.test(taskId)) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const userId = c.get("user").id;

  const [task] = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);
  if (!task) {
    return c.json({ error: "Task not found" }, 404);
  }

  // Idempotent: re-marking keeps the original completion timestamp.
  const [inserted] = await db
    .insert(taskCompletions)
    .values({ userId, taskId })
    .onConflictDoNothing()
    .returning({ completedAt: taskCompletions.completedAt });

  let completedAt = inserted?.completedAt;
  if (!completedAt) {
    const [existing] = await db
      .select({ completedAt: taskCompletions.completedAt })
      .from(taskCompletions)
      .where(
        and(eq(taskCompletions.taskId, taskId), eq(taskCompletions.userId, userId))
      )
      .limit(1);
    completedAt = existing?.completedAt;
  }

  return c.json({ taskId, completed: true, completedAt });
});

// DELETE /tasks/:id/complete — unmark a task for the current user (idempotent).
taskRoutes.delete("/:id/complete", async (c) => {
  const taskId = c.req.param("id");
  if (!UUID_RE.test(taskId)) {
    return c.json({ error: "Invalid task id" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const userId = c.get("user").id;

  await db
    .delete(taskCompletions)
    .where(
      and(eq(taskCompletions.taskId, taskId), eq(taskCompletions.userId, userId))
    );

  return c.json({ taskId, completed: false, completedAt: null });
});
