import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { EventorCompetitionsTable } from './eventor_competitions';
import { EventorClassesTable } from './eventor_classes';
import { OLRunnersTable } from './ol_runners';
import { OLOrganizationsTable } from './ol_organizations';

export const EventorSignupsTable = pgTable('eventor_signups', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorClassId: varchar({ length: 255 }).notNull(),
  eventorId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: integer(),
  olRunnerId: integer(),
  punchCardNumber: varchar({ length: 255 }),
  ...commonFields,
});

export const EventorSignupsRelations = relations(
  EventorSignupsTable,
  ({ one }) => ({
    eventorCompetition: one(EventorCompetitionsTable, {
      fields: [EventorSignupsTable.eventorId],
      references: [EventorCompetitionsTable.eventorId],
    }),
    eventorClass: one(EventorClassesTable, {
      fields: [EventorSignupsTable.eventorClassId],
      references: [EventorClassesTable.eventorClassId],
    }),
    olRunnerId: one(OLRunnersTable, {
      fields: [EventorSignupsTable.olRunnerId],
      references: [OLRunnersTable.id],
    }),
    olOrganizationId: one(OLOrganizationsTable, {
      fields: [EventorSignupsTable.olOrganizationId],
      references: [OLOrganizationsTable.id],
    }),
  }),
);
