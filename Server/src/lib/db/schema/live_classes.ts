import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { LiveCompetitionsTable } from './live_competitions';
import { relations } from 'drizzle-orm';
import { LiveSplitControllsTable } from './live_split_controlls';
import { LiveResultsTable } from './live_results';

export const LiveClassesTable = pgTable('live_classes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveClassId: varchar({ length: 255 }).notNull().unique(),
  liveCompetitionId: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  ...commonFields,
});

export const LiveClassesRelations = relations(
  LiveClassesTable,
  ({ one, many }) => ({
    liveCompetition: one(LiveCompetitionsTable, {
      fields: [LiveClassesTable.liveCompetitionId],
      references: [LiveCompetitionsTable.id],
    }),
    liveSplitControlls: many(LiveSplitControllsTable),
    liveResults: many(LiveResultsTable),
  }),
);
