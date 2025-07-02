import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { EventorResultsTable } from './eventor_results';
import { EventorStartTable } from './eventor_start';
import { EventorSignupsTable } from './eventor_signups';
import { EventorCompetitionsTable } from './eventor_competitions';

export const EventorClassesTable = pgTable('eventor_classes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorClassId: varchar({ length: 255 }).notNull().unique(),
  eventorId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  distanceInMeters: integer(),
  ...commonFields,
});

export const EventorClassesRelations = relations(
  EventorClassesTable,
  ({ one, many }) => ({
    eventorResults: many(EventorResultsTable),
    eventorStart: many(EventorStartTable),
    eventorSignups: many(EventorSignupsTable),
    eventorCompetition: one(EventorCompetitionsTable, {
      fields: [EventorClassesTable.eventorId],
      references: [EventorCompetitionsTable.eventorId],
    }),
  }),
);
