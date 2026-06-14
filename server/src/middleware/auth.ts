import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { AppEnv, Role } from "../types";

// Verifies the `Authorization: Bearer <token>` header and puts the decoded
// principal on the context as `user`. Reads JWT_SECRET from env per request.
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return c.json({ error: "Missing or malformed Authorization header" }, 401);
  }

  const token = header.slice("Bearer ".length).trim();
  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    c.set("user", {
      id: String(payload.sub),
      email: String(payload.email),
      role: payload.role as Role,
    });
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

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
