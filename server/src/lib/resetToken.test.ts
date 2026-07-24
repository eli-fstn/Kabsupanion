import { describe, it, expect } from "vitest";
import { generateResetToken, hashResetToken } from "./resetToken";

describe("reset token", () => {
  it("generates unique, URL-safe tokens", () => {
    const a = generateResetToken();
    const b = generateResetToken();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/); // base64url, no padding
    expect(a.length).toBeGreaterThanOrEqual(43); // 32 bytes -> 43 chars
  });

  it("hashes deterministically (same token -> same hash)", async () => {
    const t = generateResetToken();
    expect(await hashResetToken(t)).toBe(await hashResetToken(t));
  });

  it("different tokens hash differently, and hash is hex sha-256", async () => {
    const h = await hashResetToken("abc");
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(await hashResetToken("abc")).not.toBe(await hashResetToken("abd"));
  });
});
