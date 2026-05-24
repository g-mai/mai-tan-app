ALTER TABLE "organization" ADD COLUMN "description" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "first_name" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "last_name" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "favourite_organization" text DEFAULT '';