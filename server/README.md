# KabsuPanion API

A deployable **Cloudflare Workers** API built with **Hono**, talking to **Neon Postgres**
through **Drizzle** (Neon HTTP driver).

- **Phase 0 (done):** a `tasks` resource + health check, live on Workers.
- **Phase 1 (in progress):** JWT auth + a `users` table (register/login/me). Still to come:
  auth-gating existing routes, admin role management, subjects/schedule/notes/announcements,
  and Cloudinary.

## Stack

- **Runtime:** Cloudflare Workers (V8 isolate, not Node) via `wrangler`
- **Framework:** Hono (TypeScript)
- **DB driver:** `@neondatabase/serverless` (HTTP) + `drizzle-orm/neon-http`
- **Migrations:** `drizzle-kit`

## Routes

| Method | Path             | Auth   | Description                                                        |
| ------ | ---------------- | ------ | ------------------------------------------------------------------ |
| GET    | `/health`        | —      | Liveness check → `{ "ok": true }`                                  |
| POST   | `/auth/register` | —      | Sign up: `{ email, password, name }` → `201 { user, token }` (always `student`) |
| POST   | `/auth/login`    | —      | Log in: `{ email, password }` → `{ user, token }`                  |
| GET    | `/auth/me`       | Bearer | Current user from the JWT                                          |
| GET    | `/tasks`         | —      | List all tasks, newest first                                       |
| POST   | `/tasks`         | —      | Create a task from `{ title, description?, dueDate? }`; `title` required |

Authenticated requests send `Authorization: Bearer <token>` (the `token` returned by
register/login). Tokens are HS256 JWTs signed with `JWT_SECRET`, valid for 7 days.

## For frontend devs

Everything you need to call this API from the client.

### Base URL

| Environment | URL |
| ----------- | --- |
| Local dev | `http://localhost:8787` |
| Production | `https://kabsupanion-api.<subdomain>.workers.dev` _(ask the backend dev for the exact subdomain)_ |

**CORS:** the API currently allows `http://localhost:5173` (Vite dev server) and the
placeholder Vercel origin. If your dev server runs on a different port, or once the real
Vercel URL exists, the backend must add it — ping the backend dev.

### Auth flow

1. Call `POST /auth/register` or `POST /auth/login`. Both return `{ user, token }`.
2. Store the `token` (it's a JWT, valid 7 days) and send it on protected requests as
   the header `Authorization: Bearer <token>`.
3. On a `401`, treat the token as missing/invalid/expired and route the user back to login.

### Response shapes

A **user** (returned by register, login, and `/auth/me` — never includes the password):

```json
{
  "id": "uuid",
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

A **task** (returned by `/tasks`):

```json
{
  "id": "uuid",
  "title": "Read chapter 3",
  "description": null,
  "dueDate": null,
  "createdAt": "2026-06-13T08:00:00.000Z",
  "updatedAt": "2026-06-13T08:00:00.000Z"
}
```

`GET /tasks` returns an **array** of these; `POST /tasks` returns the single created task.

### Error conventions

Every failure returns a JSON body `{ "error": "human-readable message" }` with a status code:

| Status | Meaning |
| ------ | ------- |
| `400` | Missing/invalid fields, or a malformed JSON body |
| `401` | Missing/invalid/expired token, or wrong login credentials |
| `409` | Email already registered (on `register`) |

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

**Phase 0: ✅ complete and deployed. Phase 1 auth: code complete, pending migrate + deploy.**

| Capability | Status | Notes |
| ---------- | ------ | ----- |
| `GET /health` | ✅ live | Returns `{ "ok": true }`; no DB access. |
| `GET /tasks` / `POST /tasks` | ✅ live | Create/list against Neon; data persists. Still **public** (not auth-gated yet). |
| Neon `tasks` table | ✅ migrated | Live in Neon. |
| Production deploy | ✅ deployed | Live `*.workers.dev` URL passes all Phase 0 checks. |
| JWT auth (register/login/me) | 🟡 code complete | Routes + middleware written; validation/middleware paths verified locally. Needs `db:migrate` + a real `JWT_SECRET`, then end-to-end verification + deploy. |
| Neon `users` table | 🟡 migration generated | `drizzle/0001_*.sql` ready; **not yet applied** — run `npm run db:migrate`. |
| Auth-gating `/tasks`, admin roles, other tables | 🔲 Phase 1 (next) | subjects, schedule, notes, announcements, Cloudinary. |

See [CHANGELOG.md](./CHANGELOG.md) for the release summary and [CHANGES.md](./CHANGES.md)
for the development journal.

## Why `DATABASE_URL` is configured in two places

This is the #1 thing that breaks Drizzle-on-Workers setups:

- **The Worker runtime** reads it from `.dev.vars` (local) and from a Wrangler secret
  (production). It is **never** in `wrangler.toml`.
- **`drizzle-kit`** runs in Node on your machine (not on Workers), so it reads a normal
  `.env`. `drizzle.config.ts` loads it via `import "dotenv/config"`.

So the same connection string goes into `.dev.vars`, `.env`, **and** a production secret.
