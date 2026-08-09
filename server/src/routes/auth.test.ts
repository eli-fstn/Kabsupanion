import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { authRoutes } from "./auth";

// NOTE: the happy-path register/login flow and roster-gating hit Neon, and this
// project shares one DB between local dev and prod, so those are intentionally
// NOT exercised here (would need a dedicated test database). These cover the
// input-validation branches that return before any DB access. The rate-limit
// bindings are absent in this env; `underLimit` tolerates that and allows through.
const app = () => {
  const a = new Hono();
  a.route("/auth", authRoutes);
  return a;
};
const ENV = {} as never;
const post = (body: unknown) => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

describe("POST /auth/register validation", () => {
  it("400 when studentNumber is missing", async () => {
    const res = await app().request("/auth/register", post({ email: "a@b.com", password: "password123" }), ENV);
    expect(res.status).toBe(400);
  });
  it("400 on an invalid email", async () => {
    const res = await app().request("/auth/register", post({ studentNumber: "X", email: "nope", password: "password123" }), ENV);
    expect(res.status).toBe(400);
  });
  it("400 on a too-short password", async () => {
    const res = await app().request("/auth/register", post({ studentNumber: "X", email: "a@b.com", password: "short" }), ENV);
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login validation", () => {
  it("400 when email/password are missing", async () => {
    const res = await app().request("/auth/login", post({}), ENV);
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/reset-password validation", () => {
  it("400 when the token is missing", async () => {
    const res = await app().request("/auth/reset-password", post({ password: "password123" }), ENV);
    expect(res.status).toBe(400);
  });
  it("400 on a too-short password", async () => {
    const res = await app().request("/auth/reset-password", post({ token: "abc", password: "short" }), ENV);
    expect(res.status).toBe(400);
  });
});

describe("POST /auth/forgot-password", () => {
  it("is gone — self-service reset was replaced by admin-generated links", async () => {
    const res = await app().request("/auth/forgot-password", post({ email: "a@b.com" }), ENV);
    expect(res.status).toBe(404);
  });
});
