# Changelog

All notable changes to the **KabsuPanion API** (backend) are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

_Phase 1 in progress. Still to come: auth-gating existing routes, admin role management,
subjects/schedule/notes/announcements, Cloudinary._

### Added

- **JWT authentication** (Hono `hono/jwt`, HS256, 7-day tokens signed with `JWT_SECRET`).
- `users` table (`email` unique, `password_hash`, `name`, `role` enum `student|admin`).
- Password hashing via Web Crypto **PBKDF2/SHA-256** (no native deps; Workers-safe),
  with constant-time verification.
- Auth routes:
  - `POST /auth/register` → `{ email, password, name }`; `400` invalid / `409` email taken;
    returns `201 { user, token }`. Always creates `student` (role in body is ignored).
  - `POST /auth/login` → `{ email, password }`; `401` generic message on bad credentials;
    returns `{ user, token }`.
  - `GET /auth/me` → requires `Authorization: Bearer <token>`; returns the current user.
- `requireAuth` and `requireAdmin` middleware.
- New migration `drizzle/0001_*.sql` for the `users` table + `user_role` enum.

### Changed

- Refactored routes into `src/routes/` (`auth.ts`, `tasks.ts`); `index.ts` now mounts routers.
- Shared types moved to `src/types.ts` (`Env`, `Role`, `AuthUser`, `AppEnv`).
- CORS now allows the `Authorization` header.

### Notes

- Code complete and typechecks clean; validation + middleware paths verified locally with
  dummy vars. Not yet migrated to Neon or deployed — the DB-backed register/login success
  path is unverified end-to-end. `JWT_SECRET` is now functional (was a placeholder).

## [0.0.0] — 2026-06-13

Phase 0 "walking skeleton": one thin vertical slice working end-to-end and deployed.

### Added

- Cloudflare Workers project scaffolding with **wrangler** (`wrangler.toml`, `name = kabsupanion-api`).
- **Hono** app (`src/index.ts`) with a typed `Env` interface (`DATABASE_URL`, placeholder `JWT_SECRET`).
- CORS allowing `http://localhost:5173` and a placeholder Vercel origin; methods `GET, POST, PATCH, DELETE`.
- Routes:
  - `GET /health` → `{ ok: true }`.
  - `GET /tasks` → list all tasks, ordered by `createdAt` desc.
  - `POST /tasks` → create a task from `{ title, description?, dueDate? }`; returns `201`,
    or `400` when `title` is missing/empty or the JSON body is invalid.
- **Drizzle** schema (`src/db/schema.ts`) with a minimal `tasks` table
  (`id`, `title`, `description`, `dueDate`, `createdAt`, `updatedAt`).
- Per-request DB client (`src/db/client.ts`) using the **Neon HTTP driver**
  (`@neondatabase/serverless` + `drizzle-orm/neon-http`).
- `drizzle.config.ts` (current `defineConfig` shape, `dialect: "postgresql"`), loading `.env` via `dotenv`.
- Initial generated migration in `drizzle/` and applied to Neon (`tasks` table created).
- npm scripts: `dev`, `deploy`, `db:generate`, `db:migrate`.
- Committed env templates (`.dev.vars.example`, `.env.example`) and `.gitignore`.
- README with setup, manual steps, and Phase 1 scope note.

### Notes

- Verified end-to-end: migrations applied to Neon, local create/list loop works and persists
  across restarts, and the deployed `*.workers.dev` URL passes the same checks.
- wrangler pinned to **v4** during setup (devDependency bump; no source changes required).
