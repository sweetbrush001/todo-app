ALTER TABLE "todos" ADD COLUMN "priority" text DEFAULT 'medium' NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "category" text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "due_date" timestamp;--> statement-breakpoint
ALTER TABLE "todos" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;