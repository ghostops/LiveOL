import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { EventorCompetitionsTable } from './eventor_competitions';
import { EventorClassesTable } from './eventor_classes';
import { OLRunnersTable } from './ol_runners';
import { OLOrganizationsTable } from './ol_organizations';

export const EventorStartTable = pgTable('eventor_start', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorClassId: varchar({ length: 255 }).notNull(),
  eventorId: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: integer(),
  olRunnerId: integer(),
  name: varchar({ length: 255 }).notNull(),
  startTime: varchar({ length: 255 }),
  ...commonFields,
});

export const EventorStartRelations = relations(
  EventorStartTable,
  ({ one }) => ({
    eventorCompetition: one(EventorCompetitionsTable, {
      fields: [EventorStartTable.eventorId],
      references: [EventorCompetitionsTable.eventorId],
    }),
    eventorClass: one(EventorClassesTable, {
      fields: [EventorStartTable.eventorClassId],
      references: [EventorClassesTable.eventorClassId],
    }),
    olRunnerId: one(OLRunnersTable, {
      fields: [EventorStartTable.olRunnerId],
      references: [OLRunnersTable.id],
    }),
    olOrganizationId: one(OLOrganizationsTable, {
      fields: [EventorStartTable.olOrganizationId],
      references: [OLOrganizationsTable.id],
    }),
  }),
);
