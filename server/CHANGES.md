# Development Journal

An informal, chronological log of backend work — what happened and *why*. For the formal,
version-grouped summary see [CHANGELOG.md](./CHANGELOG.md).

---

## 2026-06-18 — Subjects, schedules, and tasks tied to subjects

**Goal:** give tasks a subject context and let admins manage a weekly timetable per subject.

- New **`subjects`** table: `code` (unique, uppercased), `name`, `description?`, timestamps.
- New **`schedules`** table: `subjectId` FK (cascade), `day` enum (`monday`–`sunday`),
  `startTime`/`endTime` stored as 12-hour text strings (validated with regex, e.g. `"8:00 AM"`),
  `room?`. A subject can have multiple slots.
- **`tasks.subject_id`** added as NOT NULL FK → subjects (cascade). Migration 0004 covers
  all three changes. DB was clean (0 tasks) so the NOT NULL constraint applied without issue.
- `GET /subjects` returns subjects with schedules nested — open to any authenticated user.
  Subject CRUD + schedule CRUD are admin-only.
- `POST /tasks` now requires `subjectId`; validates the subject exists (`404` if not).
  `GET /tasks` inner-joins subjects and returns `subject: { id, code, name }` on each task;
  accepts `?subjectId=` query param for filtering.
- **Design:** cascade-delete on subjects means removing a subject cleans up its schedules
  and tasks in one shot — chosen for simplicity over blocking deletes.
- `code` is normalised to uppercase on write (`CSIT101`, not `csit101`).

## 2026-06-18 — Restrict task CRUD to admins

- Added `requireAdmin` to `POST /tasks` and new `PATCH /tasks/:id` + `DELETE /tasks/:id`.
  Students can only `GET /tasks` and mark/unmark completion. Full task CRUD is admin-only.
  `PATCH` accepts `{ title?, description?, dueDate? }` (at least one required), updates
  `updatedAt`, returns the full updated task; `400` empty title / no fields, `404` unknown.
  `DELETE` cascades to `task_completions` via FK, returns `{ id, deleted: true }`;
  `404` if not found, `400` invalid UUID. Matches the classroom checklist model: admin sets
  assignments, classmates tick them off.

## 2026-06-18 — Add DELETE /admin/users/:id

- Admins can now delete user accounts. Self-delete is blocked (`400`) to prevent
  accidental lockout. `taskCompletions` cascade via the existing FK so no orphan rows remain.
  Flagged for later: `GET /admin/users/:id` single-user lookup.

## 2026-06-18 — Phase 1: admin management API

**Goal:** give the admin account control over users and the masterlist without direct DB access.

- New **`src/routes/admin.ts`** router mounted at `/admin` in `index.ts`. No schema change,
  no new migration — reuses existing `masterlist`, `users`, and `userRole` enum.
- All routes guarded by `requireAuth` + `requireAdmin` (applied via `adminRoutes.use("*", ...)`):
  `401` for missing/invalid token, `403` for non-admin users.
- **User management:** `GET /admin/users` (all users, no passwordHash) and
  `PATCH /admin/users/:id/role` (promote/demote; self-demotion blocked with `400` to prevent
  locking out the only admin).
- **Masterlist CRUD:** `GET`, `POST`, `PATCH /:studentNumber`, `DELETE /:studentNumber`.
  Delete returns `409` if a user has already registered with that student number (FK constraint
  would block it anyway, but we surface a friendlier message first).
- Verified locally: auth gate (`401`/`403`), user list, role promote/demote, masterlist
  add/edit/delete, dup-entry `409`, claimed-entry `409`, `404` cases. All 13 checks passed.
- **Pending:** `npm run deploy` to ship the `/admin/*` routes to production (no migration needed).

## 2026-06-14 — Phase 1: per-user task completion

**Goal:** let each student tick off communal tasks individually — A marking a task done must
not mark it done for B.

- New **`task_completions`** table: `(user_id FK→users, task_id FK→tasks, completed_at)` with a
  **composite PK** so there's at most one completion per (user, task); both FKs cascade on delete.
- `GET /tasks` left-joins completions for the current user and adds `completed` (bool) +
  `completedAt`. New `POST /tasks/:id/complete` (idempotent — keeps the original timestamp on
  re-complete) and `DELETE /tasks/:id/complete` (idempotent). `400` invalid uuid, `404` unknown
  task, `401` unauth. Migration `0003`.
- **Design:** tasks remain communal (no owner); only completion is per-user. The alternative —
  a single `completed` flag on the task row — was rejected because one student's tick would flip
  it for everyone.
- Verified locally against Neon: **per-user isolation** (user1 completes taskA → user1 sees
  `completed:true`, user2 still sees `false`), idempotent re-complete (timestamp unchanged),
  unmark, `404`/`400`/`401`. Test data (TEST-CMPL users/tasks) cleaned up — DB back to 0
  users/tasks/completions, 35 roster rows.
- **Deployed & verified live:** redeployed the Worker and re-ran the full matrix against
  `https://kabsupanion-api.kabsupanion.workers.dev` (per-user isolation, idempotency,
  `404`/`400`/`401`) — all pass. Test data cleaned up (0 users/tasks/completions, 35 roster rows).

## 2026-06-14 — Phase 1 deployed & verified live

- Deployed to `https://kabsupanion-api.kabsupanion.workers.dev`; prod `JWT_SECRET` set via
  `wrangler secret put`. Real section roster (35 entries, duplicate student number fixed)
  seeded into `masterlist`.
- Tested against the **live** URL with a throwaway roster entry (`TEST-DEPLOY`), then removed
  it. Full matrix passed identically to local: register `201` (role from roster — a body
  `role:"admin"` was ignored, confirming the server-side rule in prod), login `200` (proves
  the prod secret signs/verifies tokens), `/auth/me` `200`, authed `POST`/`GET /tasks`
  `201`/`200`; negatives off-roster `403`, claimed/dup-email `409`, short password `400`,
  bad/no token `401`.
- **Important infra note:** local dev and prod share ONE Neon database (`.dev.vars`
  `DATABASE_URL` = the prod `DATABASE_URL` secret). So local test runs write to the same DB
  prod reads — be deliberate about test data. Verified clean afterward: 0 users, 0 tasks,
  35 real masterlist rows, no `TEST-DEPLOY*`/`2024-0000*` leftovers.
- Pending: the user registers the first admin (`251080225`) on the live URL.

## 2026-06-14 — Phase 1: roster-gated registration (masterlist)

**Goal:** stop open self-registration. Only real section members register — but the school
roster has only **student numbers + full names, no emails** (privacy), so we gate on the
student number and let each person bring their own email.

### What changed
- New **`masterlist`** table (`student_number` PK, `full_name`, `role`) — the pre-loaded
  roster. New **`users.student_number`** (unique, FK → masterlist) links an account to its
  roster entry; one account per student number.
- **`POST /auth/register`** reworked: input `{ studentNumber, email, password }`. Succeeds
  only if the student number is on the masterlist AND unclaimed AND the email is free.
  `name`/`role` are copied from the masterlist row **server-side** — never from the body —
  so the display name can't be spoofed and admin can't be self-claimed. Errors: `400` / `403`
  off-roster / `409` claimed-or-dup-email. Login + `/auth/me` unchanged.
- Seeding: `scripts/seed.ts` (run via new `tsx` dep, `npm run db:seed`) upserts
  `seed/masterlist.json` (git-ignored PII) into the masterlist. `seed/masterlist.example.json`
  is the committed shape. First admin = a roster row with `role: "admin"`.

### Design rationale
Email verification was considered and rejected for this goal: it proves a mailbox is real,
not that the person is a section member — orthogonal to what we needed. Student-number gating
solves membership using the only roster data available.

### Migration note
`0002` adds `student_number NOT NULL` to `users`, which fails on existing rows → cleared the
leftover Phase-1 test users (`DELETE FROM users;`) before migrating.

### Verified (local, against Neon)
admin register `201` (role from roster) · student register `201` · off-roster `403` ·
claimed `409` · dup-email `409` · login `200` · wrong password `401` · authed `POST`/`GET
/tasks` `201`/`200` · no-token `/tasks` `401` · `/auth/me` `200`. `passwordHash` absent
everywhere. Test data (ada@/alan@, masterlist `2024-0000{1,2,3}`) left in Neon — clear before
real use. Not yet deployed.

## 2026-06-14 — Phase 1 auth verified end-to-end (local)

- Ran `db:migrate` (users table applied) and tested the full flow against real Neon via
  `wrangler dev`: register `201`, login `200`, `/auth/me` `200`, authed `POST`/`GET /tasks`
  `201`/`200`. Negatives: dup email `409`, wrong password `401`, no-token `/tasks` `401`,
  short password `400`. `passwordHash` confirmed absent from all responses. `GET /tasks`
  returned the new task alongside the Phase-0 "Deployed Task" — confirms the communal pool.
- **Gotcha (self-inflicted):** earlier smoke tests wrote dummy values into `.dev.vars` and
  then `rm`'d it, repeatedly destroying the user's real secrets file (looked like "the system
  keeps deleting it"). Also surfaced that **wrangler v4 falls back to `.env` when `.dev.vars`
  is absent**, which silently dropped `JWT_SECRET` (only in `.dev.vars`) → `sign()` got
  `undefined` → `500`. Fix: rebuilt `.dev.vars` (DATABASE_URL from `.env` + generated dev
  JWT_SECRET); going forward, never overwrite/rm `.dev.vars` or `.env`.
- Still pending: production deploy (`wrangler secret put JWT_SECRET` first).

## 2026-06-13 — Phase 1, part 2: auth-gate /tasks

**Goal:** require login to access the tasks resource.

- Applied `requireAuth` to the whole `/tasks` router (`taskRoutes.use("*", requireAuth)`),
  so both `GET` and `POST` are now protected. Reused the middleware from part 1 — no new code paths.
- **Decision:** gating only requires *a* valid login, not ownership. Tasks have no `userId`
  FK yet, so any authenticated user sees all tasks. Per-user tasks would be a separate schema
  change (add `userId`, filter queries) — deferred until we decide tasks should be private.
- Verified locally (dummy vars): `GET`/`POST /tasks` without a token → `401`, with a bad
  token → `401`. The `401` fires before body validation (a tokenless `POST` returns `401`,
  not `400`), confirming the gate sits in front. `/health` still open. Typecheck clean.
- Docs (README routes/status/frontend, CLAUDE.md, CHANGELOG) updated to mark `/tasks` as Bearer.
- Not re-verified: the authenticated success path — needs `db:migrate` (users table) + a real token.

## 2026-06-13 — Phase 1, part 1: authentication

**Goal:** add JWT auth + a `users` table (register / login / me) as the first Phase 1 slice.

### Key decisions (all Workers-correct, easy to change)
- **JWT via `hono/jwt`** — built into Hono, no new dependency. HS256, 7-day tokens, signed
  with `JWT_SECRET` (which was a Phase-0 placeholder and is now actually used).
- **Password hashing via Web Crypto PBKDF2/SHA-256**, not bcrypt/argon2 — those need native
  Node bindings that don't run on Workers. Stored as `pbkdf2$<iters>$<salt>$<hash>`, verified
  in constant time.
- **Public registration always creates `student`.** Any `role` in the request body is ignored
  so nobody can self-promote to `admin`. Admin will be granted out-of-band later.
- **Left `/tasks` public this round** to keep the change focused on auth; gating it is next.

### Structure
- Refactored into `src/routes/` (`auth.ts`, `tasks.ts`) with `index.ts` mounting routers;
  shared types in `src/types.ts`; auth middleware in `src/middleware/auth.ts`; hashing in
  `src/lib/password.ts`. Added `Authorization` to the CORS allow-list.

### Gotcha hit (and fixed)
- **`verify` from `hono/jwt` required a 3rd argument** in this Hono version
  (`verify(token, secret, alg)`). Typecheck caught it; passed `"HS256"` explicitly to both
  `sign` and `verify` so they always agree on the algorithm.

### Verified / not yet
- `tsc` clean; migration `0001_*.sql` generated (correct enum + unique email).
- Smoke-tested wiring with dummy vars: `/health`, all register/login `400` branches, and
  `/auth/me` `401` branches pass.
- **Not yet:** `db:migrate` for `users`, a real `JWT_SECRET`, the full register→login→me
  round-trip against Neon, and deploy. Those are the user's next steps.

---

## 2026-06-13 — Phase 0 build & deploy

**Goal:** stand up a deployable "walking skeleton" — one vertical slice (`tasks`) running
end-to-end on Cloudflare Workers + Neon Postgres, no auth or extra tables yet.

### Scaffolding
- Created the `server/` project (the React frontend stays in `../client/`).
- Chose the exact required stack: Workers (V8 isolate, not Node) + Hono + Drizzle + the
  **Neon HTTP driver**. The HTTP driver matters because Workers can't hold long-lived TCP
  connections, so the DB client is built fresh per request rather than pooled at startup.
- Wrote schema, per-request client, Hono routes, and `drizzle.config.ts` (current
  `defineConfig` shape — deliberately avoided the deprecated `driver: "pg"` form).

### Verified during build
- `tsc --noEmit` clean.
- `db:generate` produced correct SQL (`gen_random_uuid()`, `timestamptz`, NOT NULL where specified).
- `wrangler dev` boots; `/health` → `{"ok":true}`; empty-title `POST /tasks` → `400`
  (validation runs before DB access, so this was confirmable without a live DB).

### Decisions along the way
- **wrangler v3 → v4 upgrade.** Nothing in the plan depended on a specific version, but since
  this is greenfield we bumped to v4 for long-term maintainability. Verified version, lockfile
  sync, and typecheck after the bump.
- **Added a local-only `CLAUDE.md`** (git-ignored) to carry project context across sessions.

### Bringing the database online
- User created a Neon project and supplied the **pooled** connection string.
- Reinforced the "three places" rule for `DATABASE_URL`: `.env` (drizzle-kit), `.dev.vars`
  (local Worker), and `wrangler secret put` (production) — same string in all three.
- `npm run db:migrate` succeeded → `tasks` table created in Neon.

### Gotchas hit (and fixed)
- **`wrangler secret put` "missing worker name":** caused by running it from the repo root;
  wrangler reads `wrangler.toml` from the current directory, so commands must run from `server/`.
- **`POST /tasks` returned 400 with valid-looking input:** PowerShell quoting. Bash-style
  backslash-escaped JSON (`-d '{\"title\":\"x\"}'`) is sent literally by PowerShell, producing
  invalid JSON. Fix: single-quoted JSON with no backslashes via `curl.exe`, or `Invoke-RestMethod`.

### Result
- Local create/list loop works; data persists in Neon across `wrangler dev` restarts.
- `npm run deploy` published to Workers; the live `*.workers.dev` URL passes `/health`,
  `POST /tasks`, `GET /tasks`, and the `400` check. **Phase 0 complete.**
