CREATE TYPE "public"."note_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "status" "note_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "approved_by" uuid;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
-- Backfill: preserve current visibility of pre-existing notes (they'd otherwise
-- all become 'pending' from the column DEFAULT and vanish for non-admins). Give
-- each an approval timestamp too, so an approved note always has a consistent
-- approved_at. (Notes have no retention timer, so there's no expiry risk here.)
UPDATE "notes" SET "status" = 'approved', "approved_at" = now() WHERE "status" = 'pending';