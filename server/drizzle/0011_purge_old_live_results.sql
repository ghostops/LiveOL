INSERT INTO "scheduled_jobs" ("jobName", "cronPattern", "jobData", "enabled")
VALUES ('purge-old-live-results', '0 1 * * *', '{}', true)
ON CONFLICT DO NOTHING;
