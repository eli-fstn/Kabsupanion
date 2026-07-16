# Development Journal

An informal, chronological log of backend work — what happened and *why*. For the formal,
version-grouped summary see [CHANGELOG.md](./CHANGELOG.md).

---

## 2026-07-16 — Notes approval workflow + task deadline auto-deletion

**Goal:** (1) gate note uploads behind admin approval (new uploads hidden until approved), and
(2) automatically delete tasks once their due date's calendar day has ended. Backend only;
frontend impact flagged, not implemented.

- **Notes approval (migration `0007`):** new `note_status` enum (`pending`/`approved`/`rejected`)
  and `notes.status` (NOT NULL default `pending`), `notes.approved_by` (FK → users, SET NULL),
  `notes.approved_at`. `POST /notes` starts `pending`; `GET /notes` filters by role (non-admins see
  `approved` + their own `pending`; admins see all, with an admin-only `?status=` moderation filter,
  `400` invalid / `403` non-admin). New `PATCH /admin/notes/:id/approve` (`409` if not pending) and
  `POST /admin/notes/:id/reject` (`409` if not pending). New `src/lib/notes.ts` `purgeNote` shared by
  reject and `DELETE /notes/:id`.
- **Task deadline sweep (no schema change — `dueDate` already existed):** `src/index.ts` is now an
  `ExportedHandler` with a `scheduled` handler; a `*/15 * * * *` cron calls `purgeOverdueTasks`
  (`src/lib/tasks.ts`), deleting tasks whose `dueDate` day has fully elapsed in Asia/Manila (UTC+8).
  `task_completions` cascade via the existing FK.

### Why (decisions + gotchas)

- **Pivot from notes-retention to task-deadline-deletion.** An earlier revision of this plan put a
  retention timer on *notes* (auto-delete approved notes after N days). That was dropped entirely:
  notes now stay until manually deleted, and the auto-deletion need moved to *tasks* instead. So
  there is **no** `NOTE_RETENTION_DAYS`, no `[vars]`, and no `purgeExpiredNotes`.
- **Deadline cutoff is end-of-day, not the due clock-time.** A task due `7-17 2:00 PM` must stay
  visible the whole calendar day so the frontend's same-day "expired" notification can fire; it's only
  swept after ~11:59 PM. Evaluated in **Asia/Manila (UTC+8, no DST)** — the school's timezone — so
  the boundary matches user perception. Fixed offset means plain arithmetic (`endOfDueDateManila`), no
  `Intl`/ICU timezone handling. Cron granularity is 15 min (cron can't fire exactly at 11:59 PM), so
  worst case a task lingers ~15 min past end-of-day.
- **Fetch-then-filter-in-JS** in `purgeOverdueTasks` (not one SQL `WHERE`): the Manila cutoff differs
  per row (depends on each task's own `dueDate`), and keeping the tz logic in JS is easier to test than
  embedding `AT TIME ZONE` in SQL. Fine at this app's task volume.
- **Reject = immediate purge, not a persisted `rejected` row** — reuses `purgeNote`, so a rejected
  upload is simply gone rather than lingering in a state nobody revisits. `rejected` stays in the enum
  for completeness.
- **Backfill (migration `0007`, hand-appended):** `UPDATE notes SET status='approved',
  approved_at=now() WHERE status='pending'` so pre-existing notes keep their current visibility (they'd
  otherwise all become `pending` from the column DEFAULT). No expiry risk since notes have no retention.
- **Migration ledger gotcha (important):** an earlier `0007` from a prior session had already been
  applied to the shared Neon DB; a branch reset removed the migration *file* but not the DB objects. So
  regenerating `0007` (`0007_fast_sandman`) collided with the existing `note_status` type on
  `db:migrate` (`type "note_status" already exists`). A `git reset` reverts files, not the database.
  Resolved by reconciling drizzle's bookkeeping — `UPDATE drizzle.__drizzle_migrations SET
  created_at=<new journal when>, hash=<new file sha256> WHERE id=<phantom row>` — adopting the phantom
  ledger row as the new migration so `db:migrate` no-ops. (Verify via `drizzle.__drizzle_migrations`
  vs `drizzle/meta/_journal.json` if it recurs.)

### Verified (local, `wrangler dev`, against Neon)

Migration reconciled → `db:migrate` clean; `npx tsc --noEmit` clean. Notes, end-to-end with a real
Cloudinary round-trip: student upload → `pending`; uploader sees own pending, a second student does
not; admin approve → `200` (approvedBy/At set), re-approve → `409`; admin `?status=pending` → `200`,
`?status=garbage` → `400`, non-admin `?status=` → `403`; reject → `200 {deleted:true}`, gone +
Cloudinary `404`, re-reject → `404`; `DELETE /notes/:id` → purged + Cloudinary `404`. Task sweep
verified **non-destructively** (read-only dry-run + `endOfDueDateManila` unit-asserts): a task due
today survives, a task due 3 days ago is selected, a task with no `dueDate` is excluded. The real
scheduled sweep was **not** triggered — it would delete the 5 already-past-due *real* tasks (Jul 6–10)
from the shared DB; that destructive run is left for deploy / explicit sign-off. **Not yet deployed.**

### Frontend impact (flagged — not implemented, backend-only change)

`GET /notes` now returns `status`/`approvedBy`/`approvedAt`; non-admins no longer see others' pending
notes; `POST /notes` returns `status:"pending"`; the two admin note endpoints will want a
moderation-queue UI. Tasks disappear ~15 min after their Manila due-day ends — intentionally timed to
leave room for the planned "near deadline" (1 day before) and "expired" (on due date) notifications.

## 2026-06-26 — Masterlist enrollment `status` + cascade-delete claimed users

**Goal:** track whether a student is `regular` or `irregular`, and let admins remove a roster
entry even after a user has registered against it.

- New **`student_status`** pg enum (`regular`/`irregular`) and a **`masterlist.status`** column
  (NOT NULL, default `regular`). It lives on `masterlist` (the source of truth for student
  identity), **not** on `users` (login credentials only). Migration `0006`.
- **`users.student_number`** FK changed to **`ON DELETE CASCADE`** (was the default RESTRICT).
- `admin.ts`: `POST /admin/masterlist` and `PATCH /admin/masterlist/:sn` now accept an optional
  `status`, validated against the enum via a new `isStatus`/`STATUSES` helper (mirrors
  `isRole`/`ROLES`); `400` on an invalid value, defaults to `regular` on insert. `GET
  /admin/masterlist` returns the new field.
- `DELETE /admin/masterlist/:sn` **dropped its `409` claimed-guard** — it now just deletes the
  roster row (`404` if missing), and the FK cascade removes the linked user account.
- **⚠️ Gotcha (semantic change):** deleting a roster entry now **silently deletes that student's
  user account too** (and, transitively, their `task_completions`). Previously this was blocked
  with `409`. Admin UIs should confirm before calling `DELETE /admin/masterlist/:sn`.
- **Design:** `status` on the roster (not the account) keeps enrollment status decoupled from
  whether the student has signed up yet — an unclaimed roster row can already be marked
  irregular. Cascade over RESTRICT chosen so admins aren't forced to delete the user first.
- Verified locally against Neon (migration `0006` applied; 37 existing rows backfilled to
  `regular`): POST default/explicit/invalid `status`, PATCH update + invalid `400`, GET returns
  the field, cascade delete (linked user gone from `GET /admin/users`), unclaimed delete, and
  `404` for a missing student number. Test data cleaned up. **Not yet deployed.**

## 2026-06-18 — Notes feature + Cloudinary service

**Goal:** communal note sharing where any authenticated user can upload study materials tied to a subject.

- New **`notes`** table: `subjectId` FK → subjects (cascade), `uploadedBy` FK → users (SET NULL —
  notes survive account deletion), `title`, `description?`, plus Cloudinary metadata fields:
  `fileUrl`, `publicId`, `resourceType`, `fileName`, `fileSize`, `format`. Migration `0005`.
- New **`src/lib/cloudinary.ts`**: `uploadFile(file, folder, env)` and `deleteFile(publicId,
  resourceType, env)`. Signature algorithm is plain SHA-1 (not HMAC) over
  `sorted_params + api_secret` — implemented via Web Crypto `crypto.subtle.digest`, so no npm
  deps and fully Workers-safe. Files go to folder `kabsupanion/notes`.
- Three new env vars (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
  added to `Env` interface, `.dev.vars.example`, and registered as wrangler secrets.
- `GET /notes` — inner-joins subjects, left-joins users, returns nested shape; optional
  `?subjectId=` filter. Any authed user.
- `POST /notes` — multipart/form-data; MIME-type allowlist (images/PDF/Word/PowerPoint) and
  10 MB cap enforced before upload reaches Cloudinary. `404` if subject doesn't exist. `502`
  if Cloudinary upload fails. Any authed user.
- `PATCH /notes/:id` — title/description only (no re-upload); uploader or admin; `403` otherwise.
- `DELETE /notes/:id` — deletes from Cloudinary (best-effort, failure swallowed) then DB;
  uploader or admin; `403` otherwise.
- **Design:** SET NULL on `uploadedBy` (not CASCADE) so class notes survive if the uploader's
  account is removed. The note content matters more than its author link.
- **Gotcha (multipart):** .NET's `System.Net.Http.MultipartFormDataContent` sends a quoted
  boundary (`boundary="abc"`) that Hono's `c.req.formData()` rejects with 400. Browser
  `FormData` (via `fetch`/Axios) and `curl` send unquoted boundaries and work correctly.
  Frontend must use the native `FormData` API — do not build multipart payloads manually.
- Verified locally: 29-check test matrix covering all four endpoints, auth, validation,
  unknown-resource, cross-user 403, and Cloudinary round-trip (real upload + delete confirmed).
  **Deployed and verified live.**

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
- **Deployed and verified live** against `https://kabsupanion-api.kabsupanion.workers.dev`:
  all 7 subject/schedule endpoints tested (GET, POST, PATCH, DELETE for subjects; POST, PATCH,
  DELETE for schedule slots); auth gate (`401`/`403`) and cascade delete confirmed.

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
- Verified locally and **deployed live**: auth gate (`401`/`403`), user list, role
  promote/demote, masterlist add/edit/delete, dup-entry `409`, claimed-entry `409`, `404`
  cases. All checks passed against prod.

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
