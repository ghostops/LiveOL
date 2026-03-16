CREATE TABLE "eventor_competitions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eventor_competitions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"eventorId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"organizer" varchar(255),
	"olOrganizationId" varchar(255) NOT NULL,
	"additionalOlOrganizationIds" json DEFAULT '[]'::json,
	"status" varchar(255),
	"date" timestamp,
	"dateString" varchar(255),
	"distance" varchar(255),
	"punchSystem" varchar(255),
	"lat" numeric(8, 6),
	"lng" numeric(9, 6),
	"notification" text,
	"links" json,
	"olCompetitionId" varchar(255) NOT NULL,
	"countryCode" varchar(2) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "eventor_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eventor_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"resultId" varchar(255) NOT NULL,
	"olClassId" varchar(255) NOT NULL,
	"eventorDatabaseId" integer NOT NULL,
	"place" varchar(255),
	"name" varchar(255) NOT NULL,
	"organization" varchar(255),
	"olOrganizationId" varchar(255) NOT NULL,
	"olRunnerId" varchar(255) NOT NULL,
	"time" integer,
	"timePlus" integer,
	"status" varchar(255),
	"distanceInMeters" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "eventor_results_resultId_unique" UNIQUE("resultId")
);
--> statement-breakpoint
CREATE TABLE "eventor_signups" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eventor_signups_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"signupId" varchar(64) NOT NULL,
	"olClassId" varchar(255) NOT NULL,
	"eventorDatabaseId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"organization" varchar(255),
	"olOrganizationId" varchar(255) NOT NULL,
	"olRunnerId" varchar(255) NOT NULL,
	"punchCardNumber" varchar(255),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "eventor_signups_signupId_unique" UNIQUE("signupId")
);
--> statement-breakpoint
CREATE TABLE "eventor_start" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "eventor_start_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"startId" varchar(255) NOT NULL,
	"olClassId" varchar(255) NOT NULL,
	"eventorDatabaseId" integer NOT NULL,
	"organization" varchar(255),
	"olOrganizationId" varchar(255) NOT NULL,
	"olRunnerId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"startTime" varchar(255),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ol_competitions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"countryCode" varchar(8),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ol_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ol_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" varchar(128) NOT NULL,
	"deviceId" varchar(255) NOT NULL,
	"hasPlus" boolean DEFAULT false NOT NULL,
	"language" varchar(16) DEFAULT 'en' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "ol_users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "ol_users_deviceId_unique" UNIQUE("deviceId")
);
--> statement-breakpoint
CREATE TABLE "ol_tracking" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "ol_tracking_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"olUserId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"clubs" varchar(255)[] DEFAULT '{}' NOT NULL,
	"classes" varchar(255)[] DEFAULT '{}' NOT NULL,
	"isMe" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ol_runners" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ol_organizations" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_classes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "live_classes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"liveClassId" varchar(255) NOT NULL,
	"liveCompetitionId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" varchar(255),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "live_classes_liveClassId_unique" UNIQUE("liveClassId")
);
--> statement-breakpoint
CREATE TABLE "live_competitions" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"organizer" varchar(255),
	"olOrganizationId" varchar(255) NOT NULL,
	"date" timestamp NOT NULL,
	"isPublic" boolean DEFAULT true,
	"isLive" boolean DEFAULT false,
	"olCompetitionId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "live_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"liveResultId" varchar(255) NOT NULL,
	"liveClassId" varchar(255) NOT NULL,
	"liveCompetitionId" integer NOT NULL,
	"olRunnerId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"organization" varchar(255),
	"olOrganizationId" varchar(255) NOT NULL,
	"result" integer,
	"timeplus" integer,
	"progress" integer DEFAULT 0,
	"status" integer,
	"place" varchar(255),
	"start" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "live_results_liveResultId_unique" UNIQUE("liveResultId")
);
--> statement-breakpoint
CREATE TABLE "live_split_controlls" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "live_split_controlls_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"liveClassId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(255),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_split_results" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "live_split_results_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"liveResultId" varchar(255) NOT NULL,
	"code" varchar(255),
	"status" integer,
	"time" integer,
	"place" integer,
	"timeplus" integer,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scheduled_jobs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "scheduled_jobs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"jobName" varchar(255) NOT NULL,
	"cronPattern" varchar(255) NOT NULL,
	"jobData" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "service_status" (
	"id" varchar PRIMARY KEY NOT NULL,
	"status" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ol_tracking" ADD CONSTRAINT "ol_tracking_olUserId_ol_users_id_fk" FOREIGN KEY ("olUserId") REFERENCES "public"."ol_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "olCompetitionIdX" ON "eventor_competitions" USING btree ("olCompetitionId");--> statement-breakpoint
CREATE INDEX "competitions_olOrganizationId_idx" ON "live_competitions" USING btree ("olOrganizationId");--> statement-breakpoint
CREATE INDEX "competitions_olCompetitionId_idx" ON "live_competitions" USING btree ("olCompetitionId");--> statement-breakpoint
CREATE INDEX "competitions_isLive_date_idx" ON "live_competitions" USING btree ("isLive","date");--> statement-breakpoint
CREATE INDEX "results_olRunnerId_idx" ON "live_results" USING btree ("olRunnerId");--> statement-breakpoint
CREATE INDEX "results_olOrganizationId_idx" ON "live_results" USING btree ("olOrganizationId");