import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Pure-logic + Hono-request tests run fine in Node (Web Crypto, Blob, fetch
    // are all global in modern Node). Route/middleware tests that need the real
    // Neon DB are out of scope here — see the note in the auth route tests.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
