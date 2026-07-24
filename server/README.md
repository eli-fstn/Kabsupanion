# KabsuPanion API

A deployable **Cloudflare Workers** API built with **Hono**, talking to **Neon Postgres**
through **Drizzle** (Neon HTTP driver).

- **Phase 0 (done):** a `tasks` resource + health check, live on Workers.
- **Phase 1 (done):** JWT auth, a `users` table, roster-gated registration (`masterlist`),
  auth-gated `/tasks`, per-user task completion, admin management API (`/admin/*`), and
  subjects + timetable schedules — **deployed and verified live**. Still to come:
  notes/announcements, Cloudinary.

## Stack

- **Runtime:** Cloudflare Workers (V8 isolate, not Node) via `wrangler`
- **Framework:** Hono (TypeScript)
- **DB driver:** `@neondatabase/serverless` (HTTP) + `drizzle-orm/neon-http`
- **Migrations:** `drizzle-kit`

## Routes

| Method | Path             | Auth   | Description                                                        |
| ------ | ---------------- | ------ | ------------------------------------------------------------------ |
| GET    | `/health`        | —      | Liveness check → `{ "ok": true, "db": "ok" }`; `503` if Neon is unreachable |
| POST   | `/auth/register` | —      | Claim a roster spot: `{ studentNumber, email, password }` → `201 { user, token }`. `name`/`role` come from the masterlist. |
| POST   | `/auth/login`    | —      | Log in: `{ email, password }` → `{ user, token }`. Rate-limited (per-IP + per-email). |
| POST   | `/auth/forgot-password` | — | `{ email }` → always a generic `200` (no enumeration); emails a reset link if the email is registered. Rate-limited. |
| POST   | `/auth/reset-password`  | — | `{ token, password }` → sets a new password, invalidates all existing sessions. `400` if the token is invalid/expired. |
| GET    | `/auth/me`       | Bearer | Current user from the JWT                                          |
| GET    | `/tasks`         | Bearer | List all tasks, newest first; each includes `completed` + `subject`. Optional `?subjectId=` filter. |
| POST   | `/tasks`         | Bearer + Admin | Create a task: `{ subjectId, title, description?, dueDate? }` |
| PATCH  | `/tasks/:id`     | Bearer + Admin | Update a task: `{ title?, description?, dueDate? }`; at least one field required |
| DELETE | `/tasks/:id`     | Bearer + Admin | Delete a task and all its completions |
| POST   | `/tasks/:id/complete` | Bearer | Mark the task done **for the current user** (idempotent) |
| DELETE | `/tasks/:id/complete` | Bearer | Unmark the task for the current user (idempotent) |
| GET    | `/subjects`           | Bearer | All subjects with nested schedule slots |
| POST   | `/subjects`           | Bearer + Admin | Create a subject: `{ code, name, description? }` |
| PATCH  | `/subjects/:id`       | Bearer + Admin | Update a subject: `{ code?, name?, description? }` |
| DELETE | `/subjects/:id`       | Bearer + Admin | Delete a subject (cascades to schedules + tasks) |
| POST   | `/subjects/:id/schedules` | Bearer + Admin | Add a timetable slot: `{ day, startTime, endTime, room? }` |
| PATCH  | `/subjects/:id/schedules/:scheduleId` | Bearer + Admin | Update a slot |
| DELETE | `/subjects/:id/schedules/:scheduleId` | Bearer + Admin | Remove a slot |
| GET    | `/notes`              | Bearer | Notes with nested subject + uploader; optional `?subjectId=` filter. Non-admins see approved notes + their own pending ones; admins see all and may pass admin-only `?status=pending\|approved\|rejected` |
| POST   | `/notes`              | Bearer | Upload a note (multipart): `subjectId`, `title`, `description?`, `file` (image/PDF/Word/PowerPoint, max 10 MB). Starts `status: "pending"` — hidden from others until approved |
| PATCH  | `/notes/:id`          | Bearer | Update `title`/`description`; uploader or admin |
| DELETE | `/notes/:id`          | Bearer | Delete note + remove from Cloudinary; uploader or admin |
| PATCH  | `/admin/notes/:id/approve` | Bearer + Admin | Approve a pending note (makes it visible). `409` if not pending |
| POST   | `/admin/notes/:id/reject`  | Bearer + Admin | Reject a pending note; deletes it immediately (DB + Cloudinary). `409` if not pending |
| GET    | `/admin/users`        | Bearer + Admin | List all registered users (no password hash) |
| PATCH  | `/admin/users/:id/role` | Bearer + Admin | Change a user's role: `{ role }`. Cannot demote yourself. |
| DELETE | `/admin/users/:id`      | Bearer + Admin | Delete a user account. Cannot delete yourself. |
| GET    | `/admin/masterlist`   | Bearer + Admin | List the full section roster |
| POST   | `/admin/masterlist`   | Bearer + Admin | Add a roster entry: `{ studentNumber, fullName, role?, status? }` (`status` = `regular`/`irregular`, defaults `regular`) |
| PATCH  | `/admin/masterlist/:studentNumber` | Bearer + Admin | Update a roster entry: `{ fullName?, role?, status? }` |
| DELETE | `/admin/masterlist/:studentNumber` | Bearer + Admin | Remove a roster entry. **⚠️ Cascades:** if a user has claimed it, their account is deleted too |

Authenticated requests send `Authorization: Bearer <token>` (the `token` returned by
register/login). Tokens are HS256 JWTs signed with `JWT_SECRET`, valid for 7 days.

## For frontend devs

Everything you need to call this API from the client.

### Base URL

| Environment | URL |
| ----------- | --- |
| Local dev | `http://localhost:8787` |
| Production | `https://kabsupanion-api.kabsupanion.workers.dev` |

**CORS:** the API currently allows `http://localhost:5173` (Vite dev server) and the
placeholder Vercel origin. If your dev server runs on a different port, or once the real
Vercel URL exists, the backend must add it — ping the backend dev.

### Auth flow

1. **Register** with `{ studentNumber, email, password }`. Registration is **roster-gated**:
   the student number must be on the pre-loaded section masterlist and not already claimed,
   or you get `403`/`409`. The display `name` and `role` come from the masterlist — they are
   **not** accepted from the request body. Returns `{ user, token }`.
2. **Login** with `{ email, password }` → `{ user, token }`.
3. Store the `token` (a JWT, valid 7 days) and send it on protected requests as
   `Authorization: Bearer <token>`.
4. On a `401`, treat the token as missing/invalid/expired and route the user back to login.

Registration error codes: `400` malformed input · `403` student number not on the roster ·
`409` student number already claimed **or** email already in use.

### Response shapes

A **user** (returned by register, login, and `/auth/me` — never includes the password):

```json
{
  "id": "uuid",
  "studentNumber": "2024-00001",
  "email": "student@kabsu.edu",
  "name": "Test Student",
  "role": "student",
  "createdAt": "2026-06-13T08:00:00.000Z",
  "updatedAt": "2026-06-13T08:00:00.000Z"
}
```

- `register` / `login` → `{ "user": { ...user }, "token": "eyJ..." }`
- `/auth/me` → `{ "user": { ...user } }`
- `role` is `"student"` or `"admin"`.

A **task** from `GET /tasks` (the `completed`/`completedAt` fields reflect the **current
user** — tasks are communal, completion is per-user):

```json
{
  "id": "uuid",
  "subjectId": "uuid",
  "title": "Read chapter 3",
  "description": null,
  "dueDate": null,
  "subject": { "id": "uuid", "code": "CSIT101", "name": "Introduction to Programming" },
  "completed": false,
  "completedAt": null,
  "createdAt": "2026-06-13T08:00:00.000Z",
  "updatedAt": "2026-06-13T08:00:00.000Z"
}
```

`GET /tasks` returns an **array** of these, optionally filtered by `?subjectId=<uuid>`.
`POST /tasks` returns the single created task (without `completed`/`subject` — use
`GET /tasks` to get the full annotated shape).

**Completion:** `POST /tasks/:id/complete` marks a task done for the logged-in user;
`DELETE /tasks/:id/complete` undoes it. Both are idempotent and return
`{ taskId, completed, completedAt }`. The same task can be `completed: true` for one student
and `false` for another. `404` if the task id doesn't exist, `400` if it isn't a valid UUID.

All `/tasks` routes **require** `Authorization: Bearer <token>` — an unauthenticated call
gets `401` (the auth check runs before body validation).

**Auto-deletion:** a task with a `dueDate` is automatically removed once its due date's calendar
day has fully elapsed in **Asia/Manila (UTC+8)** time — i.e. shortly after 11:59 PM on the due
date (a background sweep runs every 15 min), **not** at the due clock-time. This intentionally
keeps the task visible for the whole due day so a same-day "expired" notice can show first. Tasks
with no `dueDate` are never auto-deleted.

### Error conventions

Every failure returns a JSON body `{ "error": "human-readable message" }` with a status code:

| Status | Meaning |
| ------ | ------- |
| `400` | Missing/invalid fields, or a malformed JSON body |
| `401` | Missing/invalid/expired token, or wrong login credentials |
| `403` | Student number not on the section roster (on `register`) |
| `409` | Student number already claimed, or email already registered (on `register`) |
| `429` | Rate limit hit (login/register/password-reset) or the daily upload quota (20 notes/user/24h). Sends `Retry-After` |
| `502` | Upstream upload (Cloudinary) failed — details are logged server-side, not returned |
| `503` | `/health` only: the database is unreachable |

Timestamps are ISO 8601 strings (UTC). Field names are `camelCase`.

### Example (Axios)

```js
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8787" });

// Attach the token automatically on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Register / login store the token; protected calls then "just work".
async function login(email, password) {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("token", data.token);
  return data.user;
}

const me = (await api.get("/auth/me")).data.user;
```

## Status — what's up and running

**Phase 0 & Phase 1: ✅ deployed and verified live** at `https://kabsupanion-api.kabsupanion.workers.dev`.

| Capability | Status | Notes |
| ---------- | ------ | ----- |
| `GET /health` | ✅ live | Returns `{ "ok": true, "db": "ok" }`; lightweight Neon ping → `503` if the DB is unreachable. |
| `GET /tasks` / `POST /tasks` | ✅ live | Create/list against Neon; data persists. **Auth-gated** (Bearer token required). |
| JWT auth (register/login/me) | ✅ live | Full flow verified against prod; token signing confirmed. |
| Roster-gated registration | ✅ live | `403` off-roster, `409` claimed/dup-email, `201` valid; `name`/`role` from masterlist (body `role` ignored). |
| Auth-gating `/tasks` | ✅ live | `401` without/with bad token; works with a valid token. |
| Per-user task completion | ✅ live | `complete`/`uncomplete` endpoints + per-user `completed` flag; idempotent; `404`/`400`/`401` handled. Verified against prod (per-user isolation confirmed). |
| Neon tables (`tasks`/`users`/`masterlist`/`task_completions`/`subjects`/`schedules`/`notes`/`password_reset_tokens`) | ✅ migrated | `0000`–`0009` applied to Neon; masterlist seeded via `npm run db:seed`. `0006` masterlist.status + FK cascade; `0007` note approval columns; `0008` `users.token_version`; `0009` `password_reset_tokens`. |
| Admin management API (`/admin/*`) | ✅ live | User/role management + masterlist CRUD. All routes require admin token. |
| Subjects + schedules (`/subjects/*`) | ✅ live | Full admin CRUD + schedule slots. Migration `0004` applied. |
| Notes (`/notes/*`) | ✅ live | Communal note sharing with Cloudinary-backed file storage. Migration `0005` applied. |
| Notes approval workflow | ✅ live | Uploads start `pending`; role-based visibility + admin `?status=`; admin `approve`/`reject` (migration `0007`). Confirmed on prod (a `pending` note exists alongside `approved` ones). |
| Task deadline auto-deletion | ✅ live | 15-min Cron Trigger deletes tasks past their `dueDate` calendar day (Asia/Manila). No schema change. Confirmed on prod: the previously past-due tasks have been swept. |
| Security hardening (audit) | ✅ live | Auth rate limiting, revocable JWTs (`token_version`), upload magic-byte checks, password reset (Resend), JWT-secret assertion, input validation/length caps, upload quota, `/health` DB ping. Migrations `0008`/`0009` applied. Verified on prod 2026-07-24. |
| Password reset **delivery** | ⚠️ needs a domain | The `/auth/forgot-password` + `/auth/reset-password` endpoints are live and `RESEND_API_KEY` is set, but no verified Resend domain / `EMAIL_FROM` yet — the default `onboarding@resend.dev` sender only delivers to the Resend account owner. No frontend flow yet either. |
| CI (`.github/workflows/ci.yml`) | ✅ live | Two jobs: `build` (client) and `server` (typecheck + 27-test Vitest suite). The server job needs no secrets. |

See [CHANGELOG.md](./CHANGELOG.md) for the release summary and [CHANGES.md](./CHANGES.md)
for the development journal.

## Why `DATABASE_URL` is configured in two places

This is the #1 thing that breaks Drizzle-on-Workers setups:

- **The Worker runtime** reads it from `.dev.vars` (local) and from a Wrangler secret
  (production). It is **never** in `wrangler.toml`.
- **`drizzle-kit`** runs in Node on your machine (not on Workers), so it reads a normal
  `.env`. `drizzle.config.ts` loads it via `import "dotenv/config"`.

So the same connection string goes into `.dev.vars`, `.env`, **and** a production secret.
