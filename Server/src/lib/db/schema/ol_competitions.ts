import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { LiveCompetitionsTable } from './live_competitions';
import { EventorCompetitionsTable } from './eventor_competitions';

export const OLCompetitionsTable = pgTable('ol_competitions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveId: integer(),
  eventorId: varchar({ length: 255 }),
  ...commonFields,
});

export const OLCompetitionsRelations = relations(
  OLCompetitionsTable,
  ({ one }) => ({
    live: one(LiveCompetitionsTable, {
      fields: [OLCompetitionsTable.liveId],
      references: [LiveCompetitionsTable.id],
    }),
    eventor: one(EventorCompetitionsTable, {
      fields: [OLCompetitionsTable.eventorId],
      references: [EventorCompetitionsTable.eventorId],
    }),
  }),
);
