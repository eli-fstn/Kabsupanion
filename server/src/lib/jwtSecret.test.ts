import { describe, it, expect, vi } from "vitest";

// The module memoizes success in module scope, so reset modules per case to get
// a fresh un-validated state.
async function fresh() {
  vi.resetModules();
  return (await import("./jwtSecret")).assertStrongJwtSecret;
}

describe("assertStrongJwtSecret", () => {
  it("throws on a short secret", async () => {
    const assert = await fresh();
    expect(() => assert("short")).toThrow();
  });

  it("throws on undefined", async () => {
    const assert = await fresh();
    expect(() => assert(undefined)).toThrow();
  });

  it("accepts a >= 32 char secret", async () => {
    const assert = await fresh();
    expect(() => assert("a".repeat(32))).not.toThrow();
  });
});
