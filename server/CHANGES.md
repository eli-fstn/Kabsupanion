# Development Journal

An informal, chronological log of backend work — what happened and *why*. For the formal,
version-grouped summary see [CHANGELOG.md](./CHANGELOG.md).

---

## 2026-07-16 — Security hardening pass (from audit)

Working through an audit's findings in priority order. This entry grows as items land.

### #1 — Auth rate limiting (CRITICAL) ✅

- Added the **Cloudflare Workers Rate Limiting binding** (`[[ratelimits]]` in `wrangler.toml`) —
  preferred over a DB/KV counter since we're already on Workers (no extra DB writes on the hot
  login path, no migration). Three limiters (`period` may only be 10 or 60s):
  - `AUTH_IP_LIMIT` (30/min) — per client IP on `POST /auth/login`
  - `AUTH_EMAIL_LIMIT` (6/min) — per target email on `POST /auth/login` (the real brute-force guard
    for a single account, independent of the attacker's IP)
  - `REGISTER_IP_LIMIT` (10/min) — per client IP on `POST /auth/register`
- Keyed off `CF-Connecting-IP` (edge-set, unspoofable) via `src/lib/rateLimit.ts` (`clientIp` +
  `underLimit`, which tolerates a missing binding so local configs don't crash). On a block: `429`
  + `Retry-After: 60`. Generous per-IP budgets accommodate shared campus NAT; the strict per-email
  budget does the account-level protection.
- **Design:** per-IP is a coarse flood guard; per-email is the account guard. Numbers are tunable in
  `wrangler.toml`. This also blunts the registration enumeration surface (audit #4) — see that item.
- **Verified locally** (`wrangler dev` supports the binding): 6 same-email logins → `401`, 7th–8th →
  `429`; a *different* email still `401` (keying is independent); 10 registrations → then `429`;
  `Retry-After: 60` present. No deploy yet.

### #2 — Revocable JWTs (CRITICAL) ✅

- **Problem:** `requireAuth` only checked signature + expiry, so a demoted admin kept admin rights and
  a deleted user kept working for up to the 7-day token life.
- **Fix:** new `users.token_version` int column (migration `0008`, default 0), embedded in issued
  tokens as a `tv` claim. `requireAuth` now verifies the signature/expiry, then does **one indexed
  PK read** of the user and: 401s if the row is gone (deleted), takes `role` **fresh from the DB**
  (demotion is immediate), and 401s if the token's `tv` ≠ the row's `token_version`. Missing `tv`
  (legacy tokens) is treated as 0 for a graceful rollout. `token_version` is stripped from all user
  responses.
- **Design/tradeoff:** kept the 7-day TTL — revocation is what makes a stale token safe, so TTL
  length matters less. Cost is one extra indexed read per authed request (same pattern `/auth/me`
  already used) in exchange for immediate revocation. Did **not** bump `token_version` on role change
  (fresh-role read already handles demotion without logging users out on every promote); the bump is
  the "log out everywhere" lever wired to password reset (#5).
- **Verified locally:** admin B's existing token → `200` on `/admin/users`, then after admin A demotes
  B → **`403`** (fresh role) while `/auth/me` still `200`; after admin A deletes B → **`401`**; bumping
  a student's `token_version` → their token **`401`s**, and re-login issues a working fresh token.

### #3 — Upload content verification / magic bytes (HIGH) ✅

- **Problem:** `POST /notes` trusted the client-supplied `file.type` from FormData (spoofable).
- **Fix:** new `src/lib/fileType.ts` `contentMatchesType(file, mime)` reads the leading bytes and
  confirms they match a known signature for the declared type (JPEG/PNG/GIF/WEBP/PDF, OLE for
  legacy .doc/.ppt, ZIP `PK` for .docx/.pptx; WEBP also checks the `WEBP` fourCC). Fails closed for
  unknown MIMEs. Checked after the existing allowlist + size checks, before the Cloudinary upload.
- **Note:** .docx vs .pptx (and .doc vs .ppt) share a container signature, so we verify the *family*,
  not the exact office type — sufficient to block non-office payloads. A determined attacker can still
  upload a *real* allowed image with a different image MIME, which is harmless (still in the allowlist).
- **Verified:** 11/11 unit cases on the sniffer (spoofs + unknown MIME rejected); over HTTP, a real PNG
  → `201`, an HTML payload with a spoofed `image/png` type → `400`, and a real PNG declared
  `application/pdf` → `400`.

### #4 — Registration enumeration (HIGH) — mitigated via #1, messages kept (decision) ✅

- **Decision (no code change):** keep the distinct register responses — `403` not-on-roster, `409`
  student-number-claimed, `409` email-taken — and rely on the `REGISTER_IP_LIMIT` throttle from #1
  (10/min per IP) to make enumeration expensive.
- **Why not genericize:** the three outcomes have genuinely different, actionable remedies (contact
  admin / you already have an account, log in / use a different email). Collapsing them into one
  message is a real UX regression for legitimate users, which the audit explicitly warned against.
  The roster is also a known class list (low enumeration value among the actual audience).
- **Extra mitigation already present:** registration validates in order roster → claimed → email, so an
  attacker only reaches the email-taken response with a **valid, unclaimed** student number — there are
  few of those, which naturally caps email enumeration through this endpoint.
- **Login is already non-enumerable** (`/auth/login` returns a single generic "Invalid email or
  password" for both unknown-email and wrong-password). No change there.

### #5 — Password reset flow (HIGH) ✅

- No email infra existed; chose **Resend** (HTTP API, Workers-native). New `password_reset_tokens`
  table (migration `0009`): stores only the **SHA-256 hash** of a 256-bit random token (the raw token
  lives only in the emailed link), with `expires_at` (30 min), single-use `used_at`, FK cascade on
  user delete.
- New `src/lib/resetToken.ts` (generate/hash) and `src/lib/email.ts` (`sendPasswordResetEmail` via
  Resend — provider isolated here so it's swappable; best-effort so a send failure never changes the
  API response and can't be used to enumerate).
- `POST /auth/forgot-password` — always returns an identical generic `200` (never reveals whether the
  email exists); on a real match, stores a token and emails `${APP_URL}/reset-password?token=<raw>`.
- `POST /auth/reset-password` — validates the token (unused + unexpired), sets the new password, **bumps
  `token_version`** (reusing #2 to log out every existing session), and burns all of the user's reset
  tokens. Both endpoints throttled by a new `PASSWORD_RESET_LIMIT` (5/min per IP).
- **Config:** `RESEND_API_KEY`/`EMAIL_FROM` secrets + `APP_URL` var (`[vars]`, `https://kabsupanion.vercel.app`,
  reset route `/reset-password`). `EMAIL_FROM` empty → falls back to Resend's `onboarding@resend.dev`.
  **⚠️ Real delivery to arbitrary students requires verifying a sending domain in Resend and setting
  `EMAIL_FROM`;** the `onboarding@resend.dev` sender only delivers to the Resend account owner. Local
  `wrangler dev` has no key in `.dev.vars`, so local sends no-op (logged) — expected.
- **Verified locally** (token flow, no live email): forgot-password returns an identical generic `200`
  for known and unknown emails (row created only for the real user); a valid injected token resets the
  password (new pw logs in, old pw `401`), old session tokens `401` (revoked), and reused / expired /
  malformed tokens all `400`; reset tokens cascade-delete with the user.

### #6 — JWT_SECRET strength assertion (HIGH) ✅

- `src/lib/jwtSecret.ts` `assertStrongJwtSecret` (memoized per isolate; Workers has no real boot) is
  called at the start of `issueToken` and `requireAuth`. Throws (fails closed, and keeps failing until
  fixed) if `JWT_SECRET` is missing or `< 32` chars, so a weak secret can't be silently used to sign
  forgeable HS256 tokens. Verified by unit tests (short/undefined throw, `>= 32` passes).

### #7 — dueDate validation (MEDIUM) ✅

- `POST`/`PATCH /tasks` now reject a malformed `dueDate` with `400` (via `parseDueDate`). Previously a
  bad string became an `Invalid Date` that never matched the deadline-sweep cutoff, so the task would
  never be purged. Verified: `"not-a-date"` → `400`, a valid ISO string → `201`.

### #8 — Cloudinary error passthrough (MEDIUM) ✅

- `POST /notes` no longer returns Cloudinary's raw error message on `502`; it logs the detail
  server-side (`console.error`) and returns a generic "File upload failed" so provider internals aren't
  leaked. (Verified by inspection — a real `502` needs broken Cloudinary creds to trigger.)

### #9 — Per-user upload quota (MEDIUM) ✅

- `POST /notes` caps a user at **20 uploads / rolling 24h** — counted from existing `notes` rows
  (`uploadedBy` + `createdAt`), so **no schema change**. Checked before the Cloudinary upload; over
  quota → `429` + `Retry-After`. Verified: with 20 recent rows seeded, the 21st upload → `429`.

### #10 — Text length caps (MEDIUM) ✅

- New `src/lib/limits.ts` caps: title 200, name 200, code 32, description 5000, room 100. Enforced in
  `tasks.ts`, `notes.ts`, and `subjects.ts` create/update handlers → `400` when exceeded. Verified: a
  201-char task title → `400`, a 33-char subject code → `400`.

### #11 — subjects startTime < endTime (MEDIUM) ✅

- Schedule `POST` and `PATCH` now reject `startTime >= endTime` (`400`). `PATCH` loads the existing
  slot so the check uses the effective values even when only one time is changed. Verified:
  `10:00 AM`→`9:00 AM` → `400`; `9:00 AM`→`10:00 AM` → `201`.

### #12 — Automated tests (Vitest) ✅

- Added **Vitest** (`npm test`) + `vitest.config.ts`. 27 tests across 7 files: the deadline-sweep
  Manila cutoff (`endOfDueDateManila`, exported for testing — it's the destructive path), magic-byte
  sniffer, password hash/verify, reset-token hash/generate, `assertStrongJwtSecret`, `requireAuth`
  reject branches + `requireAdmin` gate (via Hono `app.request`), and auth input-validation branches.
- **Scope note:** happy-path register/login + roster-gating and `requireAuth`'s DB re-check are **not**
  covered by automated tests — they need a dedicated test database (local dev shares the prod Neon DB,
  so writing test rows from CI/unit runs is unsafe). Documented in `src/routes/auth.test.ts`. Those
  paths are covered by the manual local verification recorded above instead.

### #13 — Health check DB ping (MEDIUM) ✅

- `GET /health` now runs a lightweight `masterlist` `LIMIT 1` query: `200 { ok: true, db: "ok" }` when
  Neon is reachable, `503 { ok: false, db: "unreachable" }` otherwise — so it can't report healthy
  while the DB is down. Verified: `200 { ok: true, db: "ok" }` locally.

### Wrap-up

All 13 audit items addressed. Migrations applied: `0008` (token_version), `0009` (password_reset_tokens).
Not deployed. New config a fresh checkout/prod needs: four `[[ratelimits]]` bindings + `APP_URL` var in
`wrangler.toml`; secrets `RESEND_API_KEY` (+ optional `EMAIL_FROM`). `npm test` green (27), `tsc` clean.
CORS, Drizzle query patterns, and `client/` were left untouched per scope.

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
