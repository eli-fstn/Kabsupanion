# Changelog

All notable changes to the **KabsuPanion API** (backend) are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

_Phase 1 in progress. Still to come: subjects/schedule/notes/announcements, Cloudinary._

### Added

- **Admin management API** (`/admin/*` router, no schema change). All routes require
  `requireAuth` + `requireAdmin` (`401` no token / `403` non-admin):
  - `GET /admin/users` — all registered users (password hash excluded).
  - `PATCH /admin/users/:id/role` — promote/demote a user (`{ role }`); `400` on invalid
    role or self-demotion, `404` unknown user.
  - `GET /admin/masterlist` — full section roster.
  - `POST /admin/masterlist` — add a roster entry (`{ studentNumber, fullName, role? }`);
    `409` if the student number already exists.
  - `PATCH /admin/masterlist/:studentNumber` — update name/role (`{ fullName?, role? }`);
    `404` if not found.
  - `DELETE /admin/masterlist/:studentNumber` — remove a roster entry; `409` if a user
    has already claimed it, `404` if not found.
  _(Locally verified. Deploy pending.)_
- **Per-user task completion.** New `task_completions` table (composite PK `(user_id, task_id)`,
  cascade FKs) records which user completed which communal task. `GET /tasks` now annotates each
  task with `completed`/`completedAt` for the requesting user; `POST /tasks/:id/complete` and
  `DELETE /tasks/:id/complete` mark/unmark (idempotent; `400` bad uuid, `404` unknown task).
  Migration `drizzle/0003_*.sql`. _(Deployed and verified live — per-user isolation confirmed.)_
- **JWT authentication** (Hono `hono/jwt`, HS256, 7-day tokens signed with `JWT_SECRET`).
- `users` table (`student_number` unique FK → masterlist, `email` unique, `password_hash`,
  `name`, `role` enum `student|admin`).
- **`masterlist` table** — the pre-loaded section roster (`student_number`, `full_name`,
  `role`; no emails), plus `scripts/seed.ts` + `npm run db:seed` to load it from a
  git-ignored `seed/masterlist.json`.
- Password hashing via Web Crypto **PBKDF2/SHA-256** (no native deps; Workers-safe),
  with constant-time verification.
- Auth routes:
  - `POST /auth/register` → `{ studentNumber, email, password }`; **roster-gated** — the
    student number must be on the masterlist and unclaimed. `name`/`role` come from the
    masterlist (server-side), never the body. `400` invalid / `403` not on roster /
    `409` claimed or email taken; returns `201 { user, token }`.
  - `POST /auth/login` → `{ email, password }`; `401` generic message on bad credentials;
    returns `{ user, token }`.
  - `GET /auth/me` → requires `Authorization: Bearer <token>`; returns the current user.
- **Auth-gated `/tasks`:** `requireAuth` applies to the whole `/tasks` router; `POST /tasks`,
  `PATCH /tasks/:id`, and `DELETE /tasks/:id` additionally require `requireAdmin` — only
  admins can create, update, or delete tasks; students can only read and mark completion.
- `requireAuth` and `requireAdmin` middleware.
- Migrations `drizzle/0001_*.sql` (users + `user_role` enum) and `0002_*.sql`
  (masterlist + `users.student_number`).

### Changed

- Refactored routes into `src/routes/` (`auth.ts`, `tasks.ts`); `index.ts` now mounts routers.
- Shared types moved to `src/types.ts` (`Env`, `Role`, `AuthUser`, `AppEnv`).
- CORS now allows the `Authorization` header.
- Added `tsx` devDependency (runs the seed script).

### Notes

- **Deployed and verified live** at `https://kabsupanion-api.kabsupanion.workers.dev`
  (prod `JWT_SECRET` set via `wrangler secret put`; full happy path + `400`/`401`/`403`/`409`
  negatives all pass against prod; `passwordHash` never leaked). Real section roster (35)
  seeded; no test data remains. First admin account not yet registered.

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
