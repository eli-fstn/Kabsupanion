import { Hono } from "hono";
import { desc } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { tasks } from "../db/schema";

export const taskRoutes = new Hono<AppEnv>();

// GET /tasks — list all tasks, newest first.
taskRoutes.get("/", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return c.json(rows);
});

// POST /tasks — create a task from { title, description?, dueDate? }.
taskRoutes.post("/", async (c) => {
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
