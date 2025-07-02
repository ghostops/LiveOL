import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { EventorCompetitionsTable } from './eventor_competitions';
import { EventorClassesTable } from './eventor_classes';
import { OLRunnersTable } from './ol_runners';
import { OLOrganizationsTable } from './ol_organizations';

export const EventorResultsTable = pgTable('eventor_results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorClassId: varchar({ length: 255 }).notNull(),
  eventorId: varchar({ length: 255 }).notNull(),
  place: varchar({ length: 255 }),
  name: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: integer(),
  olRunnerId: integer(),
  time: integer(),
  timePlus: integer(),
  status: varchar({ length: 255 }),
  ...commonFields,
});

export const EventorResultsRelations = relations(
  EventorResultsTable,
  ({ one }) => ({
    eventorCompetition: one(EventorCompetitionsTable, {
      fields: [EventorResultsTable.eventorId],
      references: [EventorCompetitionsTable.eventorId],
    }),
    eventorClass: one(EventorClassesTable, {
      fields: [EventorResultsTable.eventorClassId],
      references: [EventorClassesTable.eventorClassId],
    }),
    olRunnerId: one(OLRunnersTable, {
      fields: [EventorResultsTable.olRunnerId],
      references: [OLRunnersTable.id],
    }),
    olOrganizationId: one(OLOrganizationsTable, {
      fields: [EventorResultsTable.olOrganizationId],
      references: [OLOrganizationsTable.id],
    }),
  }),
);
