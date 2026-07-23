import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing (PBKDF2/Web Crypto)", () => {
  it("verifies a correct password and rejects a wrong one", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(await verifyPassword("correct horse battery staple", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("produces a self-describing pbkdf2 string with a random salt", async () => {
    const a = await hashPassword("samepassword");
    const b = await hashPassword("samepassword");
    expect(a.startsWith("pbkdf2$")).toBe(true);
    expect(a).not.toBe(b); // different salts → different encoded hashes
    expect(await verifyPassword("samepassword", a)).toBe(true);
    expect(await verifyPassword("samepassword", b)).toBe(true);
  });

  it("returns false for a malformed stored value", async () => {
    expect(await verifyPassword("x", "not-a-valid-hash")).toBe(false);
  });
});
