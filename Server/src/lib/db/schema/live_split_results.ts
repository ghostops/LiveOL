import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { LiveResultsTable } from './live_results';

export const LiveSplitResultsTable = pgTable('live_split_results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveResultId: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 255 }),
  status: integer(),
  time: integer(),
  place: integer(),
  timeplus: integer(),
  ...commonFields,
});

export const LiveSplitResultsRelations = relations(
  LiveSplitResultsTable,
  ({ one }) => ({
    liveResult: one(LiveResultsTable, {
      fields: [LiveSplitResultsTable.liveResultId],
      references: [LiveResultsTable.liveResultId],
    }),
  }),
);
