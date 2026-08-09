import type { userRole } from "./db/schema";

// Secrets injected by the Workers runtime at request time.
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  // Frontend base for the admin-generated password-reset link
  // (`${APP_URL}/reset-password?token=...`). A non-secret `[vars]` entry.
  APP_URL?: string;
  // Cloudflare Workers Rate Limiting bindings (see wrangler.toml `[[ratelimits]]`).
  // Auth-endpoint throttling: coarse per-IP flood guards + a strict per-account
  // login guard against targeted brute force. `RateLimit` is a global type from
  // @cloudflare/workers-types.
  AUTH_IP_LIMIT: RateLimit; // per-IP login guard
  AUTH_EMAIL_LIMIT: RateLimit; // per-account (email) login guard
  REGISTER_IP_LIMIT: RateLimit; // per-IP registration guard
  PASSWORD_RESET_LIMIT: RateLimit; // per-IP guard on POST /auth/reset-password
}

// Single source of truth for roles — derived from the DB enum.
export type Role = (typeof userRole.enumValues)[number];

// The authenticated principal, reconstructed from a verified JWT.
export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

// Hono app generics shared across routers and middleware:
// `Bindings` = runtime secrets, `Variables` = per-request context we set ourselves.
export type AppEnv = {
  Bindings: Env;
  Variables: {
    user: AuthUser;
  };
};
