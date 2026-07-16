import { eq } from "drizzle-orm";
import type { Env } from "../types";
import type { Db } from "../db/client";
import { notes, type Note } from "../db/schema";
import { deleteFile } from "./cloudinary";

// Best-effort Cloudinary cleanup then DB delete. Shared by DELETE /notes/:id and
// the admin reject endpoint so both purge a note the same way. A failed
// Cloudinary delete never blocks the DB removal.
export async function purgeNote(
  db: Db,
  env: Env,
  note: Pick<Note, "id" | "publicId" | "resourceType">
): Promise<void> {
  try {
    await deleteFile(note.publicId, note.resourceType, env);
  } catch {
    // best-effort, matches existing DELETE /notes/:id behavior
  }
  await db.delete(notes).where(eq(notes.id, note.id));
}
