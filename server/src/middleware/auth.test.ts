import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import type { AppEnv } from "../types";
import { requireAuth, requireAdmin } from "./auth";

// A valid-length secret so assertStrongJwtSecret passes and we exercise the
// token branch (not the weak-secret 500).
const ENV = { JWT_SECRET: "x".repeat(40) } as unknown as AppEnv["Bindings"];

describe("requireAuth (reject branches — no DB needed)", () => {
  const app = () => {
    const a = new Hono<AppEnv>();
    a.get("/protected", requireAuth, (c) => c.json({ ok: true }));
    return a;
  };

  it("401 when the Authorization header is missing", async () => {
    expect((await app().request("/protected", {}, ENV)).status).toBe(401);
  });

  it("401 when the header is not a Bearer token", async () => {
    const res = await app().request("/protected", { headers: { Authorization: "Basic abc" } }, ENV);
    expect(res.status).toBe(401);
  });

  it("401 on an invalid/garbage bearer token (verify fails before any DB read)", async () => {
    const res = await app().request("/protected", { headers: { Authorization: "Bearer not.a.real.jwt" } }, ENV);
    expect(res.status).toBe(401);
  });
});

describe("requireAdmin", () => {
  const app = (role: "student" | "admin") => {
    const a = new Hono<AppEnv>();
    a.use("/admin", async (c, next) => {
      c.set("user", { id: "u1", email: "u@example.com", role });
      await next();
    });
    a.get("/admin", requireAdmin, (c) => c.json({ ok: true }));
    return a;
  };

  it("403 for a non-admin user", async () => {
    expect((await app("student").request("/admin")).status).toBe(403);
  });

  it("allows an admin user through", async () => {
    expect((await app("admin").request("/admin")).status).toBe(200);
  });
});
