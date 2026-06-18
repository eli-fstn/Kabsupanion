import type { userRole } from "./db/schema";

// Secrets injected by the Workers runtime at request time.
export interface Env {
  DATABASE_URL: string;
  JWT_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
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
