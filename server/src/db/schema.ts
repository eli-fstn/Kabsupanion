import {
  pgTable,
  pgEnum,
  primaryKey,
  uuid,
  text,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";

export const dayOfWeek = pgEnum("day_of_week", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// Phase 1: authentication. Roles gate access. Role is assigned server-side from
// the masterlist at registration — never from the request body — so admin can't
// be self-claimed.
export const userRole = pgEnum("user_role", ["student", "admin"]);

// A student's enrollment status on the roster: a regular full load vs. an
// irregular one. Belongs on the masterlist (student identity), not users.
export const studentStatus = pgEnum("student_status", ["regular", "irregular"]);

// The section roster, pre-loaded from data the school provides (student numbers
// + names only — no emails). Registration is gated against this table: only a
// valid, unclaimed student number can create an account.
export const masterlist = pgTable("masterlist", {
  studentNumber: text("student_number").primaryKey(),
  fullName: text("full_name").notNull(),
  role: userRole("role").notNull().default("student"),
  status: studentStatus("status").notNull().default("regular"),
});

export type MasterlistEntry = typeof masterlist.$inferSelect;

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Links the account to the roster entry it claimed. Unique = one account per
  // student number.
  studentNumber: text("student_number")
    .notNull()
    .unique()
    .references(() => masterlist.studentNumber, { onDelete: "cascade" }),
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

// Phase 1: subjects + schedules.
export const subjects = pgTable("subjects", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Subject = typeof subjects.$inferSelect;

// Each subject can have multiple timetable slots (e.g. MWF 8:00 AM – 9:00 AM).
// Times are stored as 12-hour text strings (e.g. "8:00 AM").
export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  day: dayOfWeek("day").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room"),
});

export type Schedule = typeof schedules.$inferSelect;

// Phase 0 walking skeleton: a single minimal `tasks` table.
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
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

// Phase 1: communal note sharing. Any authenticated user can upload; notes are
// shared with the whole section. uploadedBy is nullable (SET NULL) so a note
// survives if its uploader's account is deleted.
export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().defaultRandom(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  uploadedBy: uuid("uploaded_by").references(() => users.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  publicId: text("public_id").notNull(),
  resourceType: text("resource_type").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  format: text("format").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Note = typeof notes.$inferSelect;
