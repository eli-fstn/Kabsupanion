import { Hono } from "hono";
import { cors } from "hono/cors";
import type { AppEnv } from "./types";
import { authRoutes } from "./routes/auth";
import { taskRoutes } from "./routes/tasks";
import { adminRoutes } from "./routes/admin";
import { subjectRoutes } from "./routes/subjects";
import { noteRoutes } from "./routes/notes";

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

export default app;
