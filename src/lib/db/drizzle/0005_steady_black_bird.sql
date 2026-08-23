ALTER TABLE "user" ADD COLUMN "onboarding_step" text DEFAULT '';--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "is_anonymous";