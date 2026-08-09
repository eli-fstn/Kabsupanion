import { Hono } from "hono";
import { sign } from "hono/jwt";
import { and, eq, gt, isNull } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { masterlist, users, passwordResetTokens, type User } from "../db/schema";
import { hashPassword, verifyPassword } from "../lib/password";
import { requireAuth } from "../middleware/auth";
import { clientIp, underLimit } from "../lib/rateLimit";
import { hashResetToken } from "../lib/resetToken";
import { assertStrongJwtSecret } from "../lib/jwtSecret";

export const authRoutes = new Hono<AppEnv>();

const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a minute and try again.";
const RETRY_AFTER = { "Retry-After": "60" };

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Never leak the password hash (or the internal revocation counter) to clients.
function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, tokenVersion: _tokenVersion, ...rest } = user;
  return rest;
}

function issueToken(user: User, secret: string) {
  assertStrongJwtSecret(secret);
  return sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    },
    secret,
    "HS256"
  );
}

// POST /auth/register — roster-gated sign-up. Requires a valid, unclaimed
// student number from the masterlist; the registrant supplies their own email +
// password. `name` and `role` are taken from the masterlist row (server-side),
// so neither the display name nor the admin role can be forged via the body.
authRoutes.post("/register", async (c) => {
  // Per-IP throttle (before any DB work) — also blunts roster/email enumeration.
  if (!(await underLimit(c.env.REGISTER_IP_LIMIT, `register:ip:${clientIp(c)}`))) {
    return c.json({ error: RATE_LIMIT_MESSAGE }, 429, RETRY_AFTER);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { studentNumber, email, password } = (body ?? {}) as {
    studentNumber?: unknown;
    email?: unknown;
    password?: unknown;
  };

  if (!isNonEmptyString(studentNumber)) {
    return c.json({ error: "`studentNumber` is required" }, 400);
  }
  if (!isNonEmptyString(email) || !EMAIL_RE.test(email.trim())) {
    return c.json({ error: "A valid `email` is required" }, 400);
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return c.json(
      { error: `\`password\` must be at least ${MIN_PASSWORD_LENGTH} characters` },
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const normalizedStudentNumber = studentNumber.trim();
  const normalizedEmail = email.trim().toLowerCase();

  // Must be on the section roster.
  const [rosterEntry] = await db
    .select()
    .from(masterlist)
    .where(eq(masterlist.studentNumber, normalizedStudentNumber))
    .limit(1);
  if (!rosterEntry) {
    return c.json(
      { error: "That student number is not on the section roster" },
      403
    );
  }

  // One account per student number.
  const [claimed] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.studentNumber, normalizedStudentNumber))
    .limit(1);
  if (claimed) {
    return c.json(
      { error: "An account has already been registered for that student number" },
      409
    );
  }

  // Email must be free.
  const [emailTaken] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  if (emailTaken) {
    return c.json({ error: "An account with that email already exists" }, 409);
  }

  const passwordHash = await hashPassword(password);
  const [created] = await db
    .insert(users)
    .values({
      studentNumber: normalizedStudentNumber,
      email: normalizedEmail,
      passwordHash,
      name: rosterEntry.fullName,
      role: rosterEntry.role,
    })
    .returning();

  const token = await issueToken(created, c.env.JWT_SECRET);
  return c.json({ user: toPublicUser(created), token }, 201);
});

// POST /auth/login — exchange credentials for a JWT.
authRoutes.post("/login", async (c) => {
  // Coarse per-IP throttle first, before any parsing or DB work.
  if (!(await underLimit(c.env.AUTH_IP_LIMIT, `login:ip:${clientIp(c)}`))) {
    return c.json({ error: RATE_LIMIT_MESSAGE }, 429, RETRY_AFTER);
  }

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

  // Strict per-account throttle: caps targeted brute force against one email,
  // independent of the attacker's IP.
  const normalizedEmail = email.trim().toLowerCase();
  if (!(await underLimit(c.env.AUTH_EMAIL_LIMIT, `login:email:${normalizedEmail}`))) {
    return c.json({ error: RATE_LIMIT_MESSAGE }, 429, RETRY_AFTER);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  // Generic message either way so we don't reveal whether the email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: "Invalid email or password" }, 401);
  }

  const token = await issueToken(user, c.env.JWT_SECRET);
  return c.json({ user: toPublicUser(user), token });
});

// POST /auth/reset-password — consume a token, set a new password, and bump the
// user's token_version so every existing session is invalidated. Tokens are
// minted by an admin via POST /admin/users/:id/reset-password and relayed to the
// student out-of-band (there is no self-service email flow).
authRoutes.post("/reset-password", async (c) => {
  if (!(await underLimit(c.env.PASSWORD_RESET_LIMIT, `reset:ip:${clientIp(c)}`))) {
    return c.json({ error: RATE_LIMIT_MESSAGE }, 429, RETRY_AFTER);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }
  const { token, password } = (body ?? {}) as { token?: unknown; password?: unknown };
  if (!isNonEmptyString(token)) {
    return c.json({ error: "`token` is required" }, 400);
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return c.json(
      { error: `\`password\` must be at least ${MIN_PASSWORD_LENGTH} characters` },
      400
    );
  }

  const db = createDb(c.env.DATABASE_URL);
  const tokenHash = await hashResetToken(token.trim());
  const [row] = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);
  if (!row) {
    return c.json({ error: "Invalid or expired reset token" }, 400);
  }

  const [target] = await db
    .select({ tokenVersion: users.tokenVersion })
    .from(users)
    .where(eq(users.id, row.userId))
    .limit(1);

  const passwordHash = await hashPassword(password);
  await db
    .update(users)
    .set({
      passwordHash,
      tokenVersion: (target?.tokenVersion ?? 0) + 1, // revoke all sessions
      updatedAt: new Date(),
    })
    .where(eq(users.id, row.userId));

  // Single-use: burn this token and any other outstanding ones for the user.
  await db
    .update(passwordResetTokens)
    .set({ usedAt: new Date() })
    .where(eq(passwordResetTokens.userId, row.userId));

  return c.json({ ok: true, message: "Your password has been reset. Please log in." });
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
