# KabsuPanion API

A deployable **Cloudflare Workers** API built with **Hono**, talking to **Neon Postgres**
through **Drizzle** (Neon HTTP driver).

- **Phase 0 (done):** a `tasks` resource + health check, live on Workers.
- **Phase 1 (done):** JWT auth, a `users` table, roster-gated registration (`masterlist`),
  and auth-gated `/tasks` — **deployed and verified live**. Still to come: admin role
  management, subjects/schedule/notes/announcements, and Cloudinary.

## Stack

- **Runtime:** Cloudflare Workers (V8 isolate, not Node) via `wrangler`
- **Framework:** Hono (TypeScript)
- **DB driver:** `@neondatabase/serverless` (HTTP) + `drizzle-orm/neon-http`
- **Migrations:** `drizzle-kit`

## Routes

| Method | Path             | Auth   | Description                                                        |
| ------ | ---------------- | ------ | ------------------------------------------------------------------ |
| GET    | `/health`        | —      | Liveness check → `{ "ok": true }`                                  |
| POST   | `/auth/register` | —      | Claim a roster spot: `{ studentNumber, email, password }` → `201 { user, token }`. `name`/`role` come from the masterlist. |
| POST   | `/auth/login`    | —      | Log in: `{ email, password }` → `{ user, token }`                  |
| GET    | `/auth/me`       | Bearer | Current user from the JWT                                          |
| GET    | `/tasks`         | Bearer | List all tasks, newest first; each includes `completed` for the current user |
| POST   | `/tasks`         | Bearer | Create a task from `{ title, description?, dueDate? }`; `title` required |
| POST   | `/tasks/:id/complete` | Bearer | Mark the task done **for the current user** (idempotent) |
| DELETE | `/tasks/:id/complete` | Bearer | Unmark the task for the current user (idempotent) |

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
  "title": "Read chapter 3",
  "description": null,
  "dueDate": null,
  "completed": false,
  "completedAt": null,
  "createdAt": "2026-06-13T08:00:00.000Z",
  "updatedAt": "2026-06-13T08:00:00.000Z"
}
```

`GET /tasks` returns an **array** of these. `POST /tasks` returns the single created task
(without the `completed` fields — a brand-new task is uncompleted for everyone).

**Completion:** `POST /tasks/:id/complete` marks a task done for the logged-in user;
`DELETE /tasks/:id/complete` undoes it. Both are idempotent and return
`{ taskId, completed, completedAt }`. The same task can be `completed: true` for one student
and `false` for another. `404` if the task id doesn't exist, `400` if it isn't a valid UUID.

All `/tasks` routes **require** `Authorization: Bearer <token>` — an unauthenticated call
gets `401` (the auth check runs before body validation).

### Error conventions

Every failure returns a JSON body `{ "error": "human-readable message" }` with a status code:

| Status | Meaning |
| ------ | ------- |
| `400` | Missing/invalid fields, or a malformed JSON body |
| `401` | Missing/invalid/expired token, or wrong login credentials |
| `403` | Student number not on the section roster (on `register`) |
| `409` | Student number already claimed, or email already registered (on `register`) |

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
| `GET /health` | ✅ live | Returns `{ "ok": true }`; no DB access. |
| `GET /tasks` / `POST /tasks` | ✅ live | Create/list against Neon; data persists. **Auth-gated** (Bearer token required). |
| JWT auth (register/login/me) | ✅ live | Full flow verified against prod; token signing confirmed. |
| Roster-gated registration | ✅ live | `403` off-roster, `409` claimed/dup-email, `201` valid; `name`/`role` from masterlist (body `role` ignored). |
| Auth-gating `/tasks` | ✅ live | `401` without/with bad token; works with a valid token. |
| Per-user task completion | ✅ live | `complete`/`uncomplete` endpoints + per-user `completed` flag; idempotent; `404`/`400`/`401` handled. Verified against prod (per-user isolation confirmed). |
| Neon tables (`tasks`/`users`/`masterlist`/`task_completions`) | ✅ migrated | `0000`–`0003` applied to Neon; masterlist seeded via `npm run db:seed`. |
| Admin roles, other tables | 🔲 next | admin management API, subjects, schedule, notes, announcements, Cloudinary. |

See [CHANGELOG.md](./CHANGELOG.md) for the release summary and [CHANGES.md](./CHANGES.md)
for the development journal.

## Why `DATABASE_URL` is configured in two places

This is the #1 thing that breaks Drizzle-on-Workers setups:

- **The Worker runtime** reads it from `.dev.vars` (local) and from a Wrangler secret
  (production). It is **never** in `wrangler.toml`.
- **`drizzle-kit`** runs in Node on your machine (not on Workers), so it reads a normal
  `.env`. `drizzle.config.ts` loads it via `import "dotenv/config"`.

So the same connection string goes into `.dev.vars`, `.env`, **and** a production secret.
