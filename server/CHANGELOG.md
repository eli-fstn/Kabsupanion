# Changelog

All notable changes to the **KabsuPanion API** (backend) are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

_Phase 1 complete. Announcements feature cut — the section already has an existing system for that._

### Added

- **Notes approval workflow.** New `note_status` enum (`pending`/`approved`/`rejected`) and
  `notes.status` (NOT NULL, default `pending`), `notes.approved_by` (FK → users, SET NULL),
  `notes.approved_at`. Migration `drizzle/0007_*.sql` (with a backfill setting existing notes to
  `approved`). New uploads start `pending` and are hidden from other users until approved. Notes have
  **no** time-based auto-deletion — an approved note stays until manually deleted.
  - `GET /notes` — role-based visibility: non-admins see `approved` notes plus their own `pending`
    uploads; admins see everything and may pass an admin-only `?status=pending|approved|rejected`
    filter (`400` invalid value, `403` if a non-admin uses it). Responses include
    `status`/`approvedBy`/`approvedAt`.
  - `POST /notes` — created notes come back `status: "pending"`.
  - `PATCH /admin/notes/:id/approve` — approve a pending note; `404` unknown, `409` if not pending.
  - `POST /admin/notes/:id/reject` — reject a pending note; purges it immediately (Cloudinary + DB)
    rather than persisting `rejected`; `404` unknown, `409` if not pending.
  - `src/lib/notes.ts` `purgeNote` shared by reject and `DELETE /notes/:id`.
- **Task deadline auto-deletion (Cron Trigger).** The Worker's default export is now an
  `ExportedHandler` with a `scheduled` handler; a `*/15 * * * *` cron deletes tasks whose `dueDate`
  calendar day has fully elapsed in **Asia/Manila (UTC+8)** — after end-of-day, not at the due
  clock-time. Tasks with no `dueDate` are never touched; `task_completions` cascade via the existing
  FK. New `src/lib/tasks.ts` (`purgeOverdueTasks` + `endOfDueDateManila`). No schema change, no new
  env vars.
- **Masterlist enrollment status.** New `student_status` enum (`regular`/`irregular`) and a
  `masterlist.status` column (NOT NULL, default `regular`). Status lives on the roster
  (student identity), not on `users`. `POST`/`PATCH /admin/masterlist` accept an optional
  `status` (validated; `400` on an invalid value); `GET /admin/masterlist` returns it.
  Migration `drizzle/0006_*.sql`.
- **Notes** — communal note sharing tied to subjects. New `notes` table (`subjectId` FK →
  subjects cascade, `uploadedBy` FK → users SET NULL, `title`, `description?`, Cloudinary
  fields: `fileUrl`, `publicId`, `resourceType`, `fileName`, `fileSize`, `format`).
  Migration `drizzle/0005_*.sql`.
  - `GET /notes` — all notes with nested `subject: { id, code, name }` and `uploadedBy: { id, name }`;
    optional `?subjectId=` filter. Any authenticated user.
  - `POST /notes` — multipart/form-data (`subjectId`, `title`, `description?`, `file`).
    Accepted types: images, PDF, Word (`.docx`), PowerPoint (`.pptx`); max 10 MB.
    Uploads to Cloudinary folder `kabsupanion/notes`. Any authenticated user.
  - `PATCH /notes/:id` — update `title` and/or `description` (`{ title?, description? }`);
    uploader or admin only; `403` otherwise.
  - `DELETE /notes/:id` — removes DB row and deletes asset from Cloudinary; uploader or admin
    only. Cloudinary failure is best-effort and does not block DB cleanup.
  _(Deployed and verified live.)_
- **Cloudinary service** (`src/lib/cloudinary.ts`). Signed uploads via SHA-1 over
  `sorted_params + api_secret` using Web Crypto — no npm deps, Workers-safe. Exports
  `uploadFile(file, folder, env)` and `deleteFile(publicId, resourceType, env)`. Three new
  env vars: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  (`.dev.vars` + `wrangler secret put`).
  _(Deployed and verified live.)_
- **Subjects + schedules.** New `subjects` table (`code` unique, `name`, `description?`) and
  `schedules` table (FK → subjects cascade, `day` enum `monday`–`sunday`, `startTime`/`endTime`
  as 12-hour text strings, `room?`). Migration `drizzle/0004_*.sql`.
  - `GET /subjects` — all subjects with schedule slots nested (any authenticated user).
  - `POST /subjects` — create (`{ code, name, description? }`); `409` duplicate code. Admin only.
  - `PATCH /subjects/:id` — update any field; `404` unknown. Admin only.
  - `DELETE /subjects/:id` — cascades to schedules + tasks; `404` unknown. Admin only.
  - `POST /subjects/:id/schedules` — add a slot (`{ day, startTime, endTime, room? }`). Admin only.
  - `PATCH /subjects/:id/schedules/:scheduleId` — update a slot. Admin only.
  - `DELETE /subjects/:id/schedules/:scheduleId` — remove a slot. Admin only.
- **Tasks are now tied to subjects.** `tasks.subject_id` (NOT NULL FK → subjects, cascade).
  `POST /tasks` now requires `subjectId`. `GET /tasks` includes `subject: { id, code, name }`
  on each task and accepts optional `?subjectId=` query param to filter by subject.

- **Admin management API** (`/admin/*` router, no schema change). All routes require
  `requireAuth` + `requireAdmin` (`401` no token / `403` non-admin):
  - `GET /admin/users` — all registered users (password hash excluded).
  - `PATCH /admin/users/:id/role` — promote/demote a user (`{ role }`); `400` on invalid
    role or self-demotion, `404` unknown user.
  - `DELETE /admin/users/:id` — remove a user account; `400` on self-delete, `404` unknown.
  - `GET /admin/masterlist` — full section roster.
  - `POST /admin/masterlist` — add a roster entry (`{ studentNumber, fullName, role? }`);
    `409` if the student number already exists.
  - `PATCH /admin/masterlist/:studentNumber` — update name/role (`{ fullName?, role? }`);
    `404` if not found.
  - `DELETE /admin/masterlist/:studentNumber` — remove a roster entry; `409` if a user
    has already claimed it, `404` if not found.
  _(Deployed and verified live.)_
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

- **`users.student_number` FK → `ON DELETE CASCADE`** (was the default RESTRICT). Migration
  `drizzle/0006_*.sql`. As a result, `DELETE /admin/masterlist/:studentNumber` no longer
  returns `409` when the entry is claimed — it deletes the roster row and the cascade removes
  the linked user account. **⚠️ Deleting a roster entry now silently deletes that student's
  account** (and their task completions).
- Refactored routes into `src/routes/` (`auth.ts`, `tasks.ts`); `index.ts` now mounts routers.
- Shared types moved to `src/types.ts` (`Env`, `Role`, `AuthUser`, `AppEnv`).
- CORS now allows the `Authorization` header.
- Added `tsx` devDependency (runs the seed script).

### Notes

- **Deployed and verified live** at `https://kabsupanion-api.kabsupanion.workers.dev`
  (prod `JWT_SECRET` set via `wrangler secret put`; full happy path + `400`/`401`/`403`/`409`
  negatives all pass against prod; `passwordHash` never leaked). Real section roster (35)
  seeded; no test data remains.

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
