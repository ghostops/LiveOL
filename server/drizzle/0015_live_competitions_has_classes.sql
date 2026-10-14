ALTER TABLE "live_competitions" ADD COLUMN "hasClasses" boolean DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE "live_competitions" SET "hasClasses" = true
WHERE "id" IN (SELECT DISTINCT "liveCompetitionId" FROM "live_classes");
