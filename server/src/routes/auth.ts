import { Hono } from "hono";
import { sign } from "hono/jwt";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { users, type User } from "../db/schema";
import { hashPassword, verifyPassword } from "../lib/password";
import { requireAuth } from "../middleware/auth";

export const authRoutes = new Hono<AppEnv>();

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Never leak the password hash to clients.
function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

function issueToken(user: User, secret: string) {
  return sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    },
    secret,
    "HS256"
  );
}

// POST /auth/register — public sign-up. Always creates a `student`; any `role`
// supplied in the body is ignored so admin can't be self-assigned.
authRoutes.post("/register", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { email, password, name } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
    name?: unknown;
  };

  if (!isNonEmptyString(email) || !EMAIL_RE.test(email.trim())) {
    return c.json({ error: "A valid `email` is required" }, 400);
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return c.json(
      { error: `\`password\` must be at least ${MIN_PASSWORD_LENGTH} characters` },
      400
    );
  }
  if (!isNonEmptyString(name)) {
    return c.json({ error: "`name` is required" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  if (existing.length > 0) {
    return c.json({ error: "An account with that email already exists" }, 409);
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      passwordHash,
      name: name.trim(),
      role: "student",
    })
    .returning();

  const token = await issueToken(created, c.env.JWT_SECRET);
  return c.json({ user: toPublicUser(created), token }, 201);
});

// POST /auth/login — exchange credentials for a JWT.
authRoutes.post("/login", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { email, password } = (body ?? {}) as {
    email?: unknown;
    password?: unknown;
  };

  if (typeof email !== "string" || typeof password !== "string") {
    return c.json({ error: "`email` and `password` are required" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.trim().toLowerCase()))
    .limit(1);

  // Generic message either way so we don't reveal whether the email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = await issueToken(user, c.env.JWT_SECRET);
  return c.json({ user: toPublicUser(user), token });
});

// GET /auth/me — current user, resolved fresh from the DB.
authRoutes.get("/me", requireAuth, async (c) => {
  const principal = c.get("user");
  const db = createDb(c.env.DATABASE_URL);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, principal.id))
    .limit(1);

  if (!user) {
    return c.json({ error: "User no longer exists" }, 401);
  }
  return c.json({ user: toPublicUser(user) });
});
