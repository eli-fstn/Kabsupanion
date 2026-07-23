import type { Context } from "hono";
import type { AppEnv } from "../types";

// The real client IP as seen by Cloudflare. `CF-Connecting-IP` is set by the edge
// and cannot be spoofed by the client. Falls back for environments where it's
// absent (some local setups) so keys stay stable rather than throwing.
export function clientIp(c: Context<AppEnv>): string {
  return (
    c.req.header("CF-Connecting-IP") ??
    c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

// Returns true if the request is within the limit, false if it should be blocked.
// Tolerates a missing binding (e.g. a local dev config without the limiter) by
// allowing the request through rather than crashing.
export async function underLimit(
  limiter: RateLimit | undefined,
  key: string
): Promise<boolean> {
  if (!limiter) return true;
  const { success } = await limiter.limit({ key });
  return success;
}
