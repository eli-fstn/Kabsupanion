import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createDb } from "../src/db/client";
import { masterlist } from "../src/db/schema";

// Loads the section roster (student numbers + names, no emails) into the
// `masterlist` table. Registration is gated against this. Runs in Node (like
// drizzle-kit), so it reads DATABASE_URL from `.env`. No passwords here —
// users set their own at registration.

type Entry = {
  studentNumber: string;
  fullName: string;
  role?: "student" | "admin";
};

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Fill in server/.env.");
}

const seedPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../seed/masterlist.json"
);

let entries: Entry[];
try {
  entries = JSON.parse(readFileSync(seedPath, "utf8"));
} catch (err) {
  throw new Error(
    `Could not read ${seedPath}. Copy seed/masterlist.example.json to seed/masterlist.json and fill it in. (${String(err)})`
  );
}
if (!Array.isArray(entries) || entries.length === 0) {
  throw new Error(`${seedPath} must be a non-empty JSON array.`);
}

const db = createDb(databaseUrl);

let count = 0;
for (const entry of entries) {
  if (!entry.studentNumber?.trim() || !entry.fullName?.trim()) {
    throw new Error(
      `Each entry needs studentNumber + fullName: ${JSON.stringify(entry)}`
    );
  }
  const row = {
    studentNumber: entry.studentNumber.trim(),
    fullName: entry.fullName.trim(),
    role: entry.role ?? ("student" as const),
  };
  // Idempotent: re-running updates name/role but never wipes existing accounts.
  await db
    .insert(masterlist)
    .values(row)
    .onConflictDoUpdate({
      target: masterlist.studentNumber,
      set: { fullName: row.fullName, role: row.role },
    });
  count += 1;
}

console.log(`Seeded ${count} masterlist entr${count === 1 ? "y" : "ies"}.`);
