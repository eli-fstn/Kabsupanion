import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv, Env } from "./types";
import { authRoutes } from "./routes/auth";
import { taskRoutes } from "./routes/tasks";
import { adminRoutes } from "./routes/admin";
import { subjectRoutes } from "./routes/subjects";
import { noteRoutes } from "./routes/notes";
import { purgeOverdueTasks } from "./lib/tasks";

const app = new Hono<AppEnv>();

app.use(
  "*",
  cors({
    origin: [
      "http://localhost:5173",
      // TODO(phase-1): replace with the real deployed Vercel origin.
      "https://kabsupanion.vercel.app",
    ],
    allowMethods: ["GET", "POST", "PATCH", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/tasks", taskRoutes);
app.route("/admin", adminRoutes);
app.route("/subjects", subjectRoutes);
app.route("/notes", noteRoutes);

export default {
  fetch: app.fetch,
  // Cron Trigger (see wrangler.toml [triggers]): every 15 minutes, delete tasks
  // whose due date's calendar day (Asia/Manila) has fully elapsed.
  async scheduled(_event, env: Env, ctx) {
    ctx.waitUntil(
      purgeOverdueTasks(env).then((count) => {
        if (count > 0) console.log(`Deadline sweep: deleted ${count} overdue task(s).`);
      })
    );
  },
} satisfies ExportedHandler<Env>;
