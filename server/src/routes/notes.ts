import { Hono } from "hono";
import { eq, and, or } from "drizzle-orm";
import type { AppEnv } from "../types";
import { createDb } from "../db/client";
import { notes, subjects, users, noteStatus } from "../db/schema";
import { requireAuth } from "../middleware/auth";
import { uploadFile } from "../lib/cloudinary";
import { purgeNote } from "../lib/notes";

export const noteRoutes = new Hono<AppEnv>();

noteRoutes.use("*", requireAuth);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOTE_STATUSES = noteStatus.enumValues; // ["pending", "approved", "rejected"]

function isNoteStatus(value: unknown): value is (typeof NOTE_STATUSES)[number] {
  return typeof value === "string" && (NOTE_STATUSES as readonly string[]).includes(value);
}
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

// GET /notes — notes newest-first, optional ?subjectId= filter.
// Visibility: admins see everything (optionally narrowed by an admin-only
// ?status= moderation filter); everyone else sees approved notes plus their
// own still-pending uploads. Each note includes its subject and uploader.
noteRoutes.get("/", async (c) => {
  const subjectId = c.req.query("subjectId");
  if (subjectId !== undefined && !UUID_RE.test(subjectId)) {
    return c.json({ error: "Invalid subjectId" }, 400);
  }

  const user = c.get("user");
  const statusParam = c.req.query("status");

  // `?status=` is an admin-only moderation-queue filter.
  let statusFilter: (typeof NOTE_STATUSES)[number] | undefined;
  if (statusParam !== undefined) {
    if (user.role !== "admin") {
      return c.json({ error: "Forbidden" }, 403);
    }
    if (!isNoteStatus(statusParam)) {
      return c.json(
        { error: "`status` must be 'pending', 'approved', or 'rejected'" },
        400
      );
    }
    statusFilter = statusParam;
  }

  const visibility =
    user.role === "admin"
      ? statusFilter
        ? eq(notes.status, statusFilter)
        : undefined
      : or(
          eq(notes.status, "approved"),
          and(eq(notes.status, "pending"), eq(notes.uploadedBy, user.id))
        );

  const db = createDb(c.env.DATABASE_URL);

  const rows = await db
    .select({
      note: notes,
      subject: { id: subjects.id, code: subjects.code, name: subjects.name },
      uploader: { id: users.id, name: users.name },
    })
    .from(notes)
    .innerJoin(subjects, eq(subjects.id, notes.subjectId))
    .leftJoin(users, eq(users.id, notes.uploadedBy))
    .where(and(subjectId ? eq(notes.subjectId, subjectId) : undefined, visibility))
    .orderBy(notes.createdAt);

  return c.json(
    rows.map(({ note, subject, uploader }) => ({
      ...note,
      subject,
      uploadedBy: uploader,
    }))
  );
});

// POST /notes — any authenticated user. multipart/form-data:
//   subjectId  (UUID)
//   title      (string)
//   description (string, optional)
//   file       (File — image / PDF / Word / PowerPoint, max 10 MB)
noteRoutes.post("/", async (c) => {
  let form: FormData;
  try {
    form = await c.req.formData();
  } catch {
    return c.json({ error: "Expected multipart/form-data" }, 400);
  }

  const subjectId = form.get("subjectId");
  const title = form.get("title");
  const description = form.get("description");
  const file = form.get("file") as File | null;

  if (typeof subjectId !== "string" || !UUID_RE.test(subjectId)) {
    return c.json({ error: "`subjectId` must be a valid UUID" }, 400);
  }
  if (typeof title !== "string" || title.trim() === "") {
    return c.json({ error: "`title` is required" }, 400);
  }
  if (!file) {
    return c.json({ error: "`file` is required" }, 400);
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return c.json(
      { error: "File type not allowed. Accepted: images, PDF, Word (.docx), PowerPoint (.pptx)" },
      400
    );
  }
  if (file.size > MAX_BYTES) {
    return c.json({ error: "File exceeds the 10 MB limit" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const [subject] = await db
    .select({ id: subjects.id })
    .from(subjects)
    .where(eq(subjects.id, subjectId))
    .limit(1);
  if (!subject) {
    return c.json({ error: "Subject not found" }, 404);
  }

  let upload: Awaited<ReturnType<typeof uploadFile>>;
  try {
    upload = await uploadFile(file, "kabsupanion/notes", c.env);
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      502
    );
  }

  const [created] = await db
    .insert(notes)
    .values({
      subjectId,
      uploadedBy: c.get("user").id,
      title: title.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      fileUrl: upload.secureUrl,
      publicId: upload.publicId,
      resourceType: upload.resourceType,
      fileName: file.name,
      fileSize: file.size,
      format: upload.format,
      status: "pending",
    })
    .returning();

  return c.json(created, 201);
});

// PATCH /notes/:id — update title and/or description. Uploader or admin only.
// Does not allow re-uploading a file; delete and re-upload for that.
noteRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  if (!UUID_RE.test(id)) {
    return c.json({ error: "Invalid note id" }, 400);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { title, description } = (body ?? {}) as {
    title?: unknown;
    description?: unknown;
  };

  const patch: { title?: string; description?: string | null; updatedAt: Date } = {
    updatedAt: new Date(),
  };

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim() === "") {
      return c.json({ error: "`title` must be a non-empty string" }, 400);
    }
    patch.title = title.trim();
  }
  if (description !== undefined) {
    patch.description =
      typeof description === "string" && description.trim()
        ? description.trim()
        : null;
  }

  if (Object.keys(patch).length === 1) {
    return c.json({ error: "Provide `title` and/or `description` to update" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const [note] = await db
    .select({ id: notes.id, uploadedBy: notes.uploadedBy })
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1);

  if (!note) {
    return c.json({ error: "Note not found" }, 404);
  }

  const user = c.get("user");
  if (note.uploadedBy !== user.id && user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const [updated] = await db
    .update(notes)
    .set(patch)
    .where(eq(notes.id, id))
    .returning();

  return c.json(updated);
});

// DELETE /notes/:id — uploader or admin. Also removes the file from Cloudinary.
noteRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  if (!UUID_RE.test(id)) {
    return c.json({ error: "Invalid note id" }, 400);
  }

  const db = createDb(c.env.DATABASE_URL);

  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, id))
    .limit(1);

  if (!note) {
    return c.json({ error: "Note not found" }, 404);
  }

  const user = c.get("user");
  if (note.uploadedBy !== user.id && user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await purgeNote(db, c.env, note);
  return c.json({ id, deleted: true });
});
