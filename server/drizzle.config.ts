import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs in Node on your machine, so it reads DATABASE_URL from `.env`.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: databaseUrl,
  },
});
