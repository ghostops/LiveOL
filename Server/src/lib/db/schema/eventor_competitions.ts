import {
  integer,
  pgTable,
  timestamp,
  varchar,
  decimal,
  text,
} from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { EventorResultsTable } from './eventor_results';
import { EventorStartTable } from './eventor_start';
import { EventorSignupsTable } from './eventor_signups';
import { OLCompetitionsTable } from './ol_competitions';

export const EventorCompetitionsTable = pgTable('eventor_competitions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  organizer: varchar({ length: 255 }).notNull(),
  organizerId: integer(),
  status: varchar({ length: 255 }),
  date: timestamp(),
  distance: varchar({ length: 255 }),
  punchSystem: varchar({ length: 255 }),
  lat: decimal({ precision: 8, scale: 6 }),
  lng: decimal({ precision: 9, scale: 6 }),
  notification: text(),
  ...commonFields,
});

export const EventorCompetitionsRelations = relations(
  EventorCompetitionsTable,
  ({ one, many }) => ({
    eventorResults: many(EventorResultsTable),
    eventorStart: many(EventorStartTable),
    eventorSignups: many(EventorSignupsTable),
    olCompetition: one(OLCompetitionsTable, {
      fields: [EventorCompetitionsTable.eventorId],
      references: [OLCompetitionsTable.eventorId],
    }),
  }),
);
