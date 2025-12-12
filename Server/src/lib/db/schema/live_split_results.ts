import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const LiveSplitResultsTable = pgTable('live_split_results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveResultId: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 255 }).notNull(),
  status: integer(),
  time: integer(),
  place: integer(),
  timeplus: integer(),
  ...commonFields,
});
