import { integer, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const LiveResultsTable = pgTable('live_results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveResultId: varchar({ length: 255 }).notNull().unique(),
  liveClassId: varchar({ length: 255 }).notNull(),
  liveCompetitionId: integer().notNull(),
  olRunnerId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: varchar({ length: 255 }).notNull(),
  endAt: timestamp(),
  startAt: timestamp(),
  progress: integer().default(0),
  status: integer(),
  place: varchar({ length: 255 }),
  ...commonFields,
});
