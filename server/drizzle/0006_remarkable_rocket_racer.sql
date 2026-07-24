CREATE TYPE "public"."student_status" AS ENUM('regular', 'irregular');--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_student_number_masterlist_student_number_fk";
--> statement-breakpoint
ALTER TABLE "masterlist" ADD COLUMN "status" "student_status" DEFAULT 'regular' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_student_number_masterlist_student_number_fk" FOREIGN KEY ("student_number") REFERENCES "public"."masterlist"("student_number") ON DELETE cascade ON UPDATE no action;