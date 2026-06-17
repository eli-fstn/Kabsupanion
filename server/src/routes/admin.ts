import { Hono } from "hono";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { masterlist, users, userRole, type User } from "../db/schema";
import { requireAuth, requireAdmin } from "../middleware/auth";

export const adminRoutes = new Hono<AppEnv>();

// Every admin route requires a valid token AND the `admin` role.
// requireAuth must run first (it sets the user that requireAdmin reads).
adminRoutes.use("*", requireAuth, requireAdmin);

const ROLES = userRole.enumValues; // ["student", "admin"]
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isRole(value: unknown): value is (typeof ROLES)[number] {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

// Never leak password hashes.
function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

// GET /admin/users — every registered account (no password hashes).
adminRoutes.get("/users", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db.select().from(users).orderBy(users.name);
  return c.json(rows.map(toPublicUser));
});

// PATCH /admin/users/:id/role — promote/demote a user. Body: { role }.
adminRoutes.patch("/users/:id/role", async (c) => {
  const id = c.req.param("id");
  if (!UUID_RE.test(id)) {
    return c.json({ error: "Invalid user id" }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  const { role } = (body ?? {}) as { role?: unknown };
  if (!isRole(role)) {
    return c.json({ error: "`role` must be 'student' or 'admin'" }, 400);
  }

  // Guard: an admin can't demote themselves (avoids locking out the last admin).
  if (id === c.get("user").id && role !== "admin") {
    return c.json({ error: "You cannot demote your own account" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  if (!updated) {
    return c.json({ error: "User not found" }, 404);
  }
  return c.json(toPublicUser(updated));
});

// DELETE /admin/users/:id — remove a user account. Blocked if the target is
// the requesting admin (can't delete yourself).
adminRoutes.delete("/users/:id", async (c) => {
  const id = c.req.param("id");
  if (!UUID_RE.test(id)) {
    return c.json({ error: "Invalid user id" }, 400);
  }

  if (id === c.get("user").id) {
    return c.json({ error: "You cannot delete your own account" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [deleted] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (!deleted) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ id: deleted.id, deleted: true });
});

// GET /admin/masterlist — the full section roster.
adminRoutes.get("/masterlist", async (c) => {
  const db = createDb(c.env.DATABASE_URL);
  const rows = await db.select().from(masterlist).orderBy(masterlist.fullName);
  return c.json(rows);
});

// POST /admin/masterlist — add a roster entry. Body: { studentNumber, fullName, role? }.
adminRoutes.post("/masterlist", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  const { studentNumber, fullName, role } = (body ?? {}) as {
    studentNumber?: unknown;
    fullName?: unknown;
    role?: unknown;
  };

  if (!isNonEmptyString(studentNumber)) {
    return c.json({ error: "`studentNumber` is required" }, 400);
  }
  if (!isNonEmptyString(fullName)) {
    return c.json({ error: "`fullName` is required" }, 400);
  }
  if (role !== undefined && !isRole(role)) {
    return c.json({ error: "`role` must be 'student' or 'admin'" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const sn = studentNumber.trim();

  const [existing] = await db
    .select({ studentNumber: masterlist.studentNumber })
    .from(masterlist)
    .where(eq(masterlist.studentNumber, sn))
    .limit(1);
  if (existing) {
    return c.json({ error: "That student number is already on the roster" }, 409);
  }

  const [created] = await db
    .insert(masterlist)
    .values({ studentNumber: sn, fullName: fullName.trim(), role: role ?? "student" })
    .returning();
  return c.json(created, 201);
});

// PATCH /admin/masterlist/:studentNumber — edit a roster entry's name and/or role.
adminRoutes.patch("/masterlist/:studentNumber", async (c) => {
  const studentNumber = c.req.param("studentNumber");

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  const { fullName, role } = (body ?? {}) as {
    fullName?: unknown;
    role?: unknown;
  };

  const updates: { fullName?: string; role?: (typeof ROLES)[number] } = {};
  if (fullName !== undefined) {
    if (!isNonEmptyString(fullName)) {
      return c.json({ error: "`fullName` must be a non-empty string" }, 400);
    }
    updates.fullName = fullName.trim();
  }
  if (role !== undefined) {
    if (!isRole(role)) {
      return c.json({ error: "`role` must be 'student' or 'admin'" }, 400);
    }
    updates.role = role;
  }
  if (Object.keys(updates).length === 0) {
    return c.json({ error: "Provide `fullName` and/or `role` to update" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [updated] = await db
    .update(masterlist)
    .set(updates)
    .where(eq(masterlist.studentNumber, studentNumber))
    .returning();
  if (!updated) {
    return c.json({ error: "Roster entry not found" }, 404);
  }
  return c.json(updated);
});

// DELETE /admin/masterlist/:studentNumber — remove a roster entry.
// Blocked if a user has already claimed it (the users FK references it).
adminRoutes.delete("/masterlist/:studentNumber", async (c) => {
  const studentNumber = c.req.param("studentNumber");
  const db = createDb(c.env.DATABASE_URL);

  const [claimed] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.studentNumber, studentNumber))
    .limit(1);
  if (claimed) {
    return c.json(
      { error: "Cannot remove a roster entry that a user has already registered" },
      409
    );
  }

  const [deleted] = await db
    .delete(masterlist)
    .where(eq(masterlist.studentNumber, studentNumber))
    .returning({ studentNumber: masterlist.studentNumber });
  if (!deleted) {
    return c.json({ error: "Roster entry not found" }, 404);
  }
  return c.json({ studentNumber: deleted.studentNumber, deleted: true });
});
