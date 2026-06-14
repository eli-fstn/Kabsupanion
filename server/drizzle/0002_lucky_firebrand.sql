CREATE TABLE "masterlist" (
	"student_number" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "student_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_student_number_masterlist_student_number_fk" FOREIGN KEY ("student_number") REFERENCES "public"."masterlist"("student_number") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_student_number_unique" UNIQUE("student_number");