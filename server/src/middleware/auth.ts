import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { eq } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { users } from "../db/schema";
import { assertStrongJwtSecret } from "../lib/jwtSecret";

// Verifies the `Authorization: Bearer <token>` header, then re-checks the DB so
// role changes, deletions, and revocations take effect immediately rather than
// only when the (7-day) token expires:
//   - signature + expiry are validated cryptographically (no DB needed);
//   - the user is re-loaded by id — a deleted account yields 401;
//   - `role` is taken FRESH from the DB, so a demoted admin loses admin at once;
//   - the token's `tv` claim must equal the row's `token_version`, so bumping
//     that column (e.g. on password reset) invalidates all outstanding tokens.
// Cost: one indexed PK lookup per authenticated request (same pattern /auth/me
// already used) — an accepted trade for immediate revocation.
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return c.json({ error: "Missing or malformed Authorization header" }, 401);
  }

  const token = header.slice("Bearer ".length).trim();
  assertStrongJwtSecret(c.env.JWT_SECRET);
  let payload: Awaited<ReturnType<typeof verify>>;
  try {
    payload = await verify(token, c.env.JWT_SECRET, "HS256");
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  const db = createDb(c.env.DATABASE_URL);
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      tokenVersion: users.tokenVersion,
    })
    .from(users)
    .where(eq(users.id, String(payload.sub)))
    .limit(1);

  // Deleted account, or a token issued before the current revocation version.
  const claimedVersion = Number(payload.tv ?? 0);
  if (!user || user.tokenVersion !== claimedVersion) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("user", { id: user.id, email: user.email, role: user.role });
  await next();
});

// Must run AFTER requireAuth — it reads the `user` that requireAuth sets.
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const user = c.get("user");
  if (!user || user.role !== "admin") {
    return c.json({ error: "Admin access required" }, 403);
  }
  await next();
});
