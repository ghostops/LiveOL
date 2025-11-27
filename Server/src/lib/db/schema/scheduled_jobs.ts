import { boolean, integer, jsonb, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const ScheduledJobsTable = pgTable('scheduled_jobs', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  jobName: varchar({ length: 255 }).notNull(),
  cronPattern: varchar({ length: 255 }).notNull(),
  jobData: jsonb().notNull().default({}),
  enabled: boolean().notNull().default(true),
  ...commonFields,
});
