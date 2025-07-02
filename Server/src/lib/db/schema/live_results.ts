import { integer, pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { LiveClassesTable } from './live_classes';
import { LiveSplitResultsTable } from './live_split_results';
import { OLRunnersTable } from './ol_runners';

export const LiveResultsTable = pgTable('live_results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveResultId: varchar({ length: 255 }).notNull().unique(),
  liveClassId: varchar({ length: 255 }).notNull(),
  olRunnerId: integer(),
  name: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: integer(),
  endAt: timestamp(),
  startAt: timestamp(),
  progress: integer().default(0),
  status: integer(),
  ...commonFields,
});

export const LiveResultsRelations = relations(
  LiveResultsTable,
  ({ one, many }) => ({
    liveClass: one(LiveClassesTable, {
      fields: [LiveResultsTable.liveClassId],
      references: [LiveClassesTable.id],
    }),
    liveSplitResults: many(LiveSplitResultsTable),
    olRunner: one(OLRunnersTable, {
      fields: [LiveResultsTable.olRunnerId],
      references: [OLRunnersTable.id],
    }),
  }),
);
