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

---

## Manual steps you must do yourself

### 1. Create a Neon project and copy the POOLED connection string

In the [Neon console](https://console.neon.tech), create a project, then copy the
connection string that contains **`-pooler`** in the host (e.g.
`...@ep-xxxx-pooler.us-east-2.aws.neon.tech/...`). Keep `?sslmode=require`.

### 2. Paste it into all three places

```bash
cd server
cp .dev.vars.example .dev.vars   # for `wrangler dev`  — also add JWT_SECRET
cp .env.example .env             # for drizzle-kit migrations
# Edit both files, paste the pooled URL into DATABASE_URL.
```

Phase 1 also needs a **`JWT_SECRET`** (used to sign/verify auth tokens). Put a strong
random value in `.dev.vars` for local dev — `.env` does NOT need it (drizzle-kit doesn't
sign tokens). Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

For production (after you've logged in with `npx wrangler login`):

```bash
npx wrangler secret put DATABASE_URL   # paste the same pooled URL
npx wrangler secret put JWT_SECRET     # paste a strong random secret
```

### 3. Local run-and-test sequence

```bash
cd server
npm install

# Create the tasks table in Neon
npm run db:generate   # already generated once; re-run only if schema changes
npm run db:migrate    # applies migrations to your Neon DB

# Start the Worker locally (http://localhost:8787)
npm run dev
```

In a second terminal:

```bash
curl http://localhost:8787/health
# {"ok":true}

curl -X POST http://localhost:8787/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
# 201 + the created row

curl http://localhost:8787/tasks
# includes the row above

curl -i -X POST http://localhost:8787/tasks \
  -H "Content-Type: application/json" \
  -d '{}'
# HTTP/1.1 400 Bad Request
```

Data persists in Neon across restarts.

### 4. Deploy and re-test against the live URL

```bash
cd server
npx wrangler login                 # one time
npx wrangler secret put DATABASE_URL   # if not already set
npm run deploy
```

Wrangler prints the deployed URL (e.g. `https://kabsupanion-api.<subdomain>.workers.dev`).
Re-run the same `curl` checks against it:

```bash
curl https://kabsupanion-api.<subdomain>.workers.dev/health
```
