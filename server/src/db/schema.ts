import {
  pgTable,
  pgEnum,
  primaryKey,
  uuid,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Phase 1: authentication. Roles gate access. Role is assigned server-side from
// the masterlist at registration — never from the request body — so admin can't
// be self-claimed.
export const userRole = pgEnum("user_role", ["student", "admin"]);

// The section roster, pre-loaded from data the school provides (student numbers
// + names only — no emails). Registration is gated against this table: only a
// valid, unclaimed student number can create an account.
export const masterlist = pgTable("masterlist", {
  studentNumber: text("student_number").primaryKey(),
  fullName: text("full_name").notNull(),
  role: userRole("role").notNull().default("student"),
});

export type MasterlistEntry = typeof masterlist.$inferSelect;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Links the account to the roster entry it claimed. Unique = one account per
  // student number.
  studentNumber: text("student_number")
    .notNull()
    .unique()
    .references(() => masterlist.studentNumber),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("student"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// Phase 0 walking skeleton: a single minimal `tasks` table.
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// Per-user completion of communal tasks. A row means "this user has marked this
// task done". Composite PK → at most one completion per (user, task). Cascades
// so deleting a task or user cleans up its completions.
export const taskCompletions = pgTable(
  "task_completions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.taskId] })]
);

export type TaskCompletion = typeof taskCompletions.$inferSelect;
