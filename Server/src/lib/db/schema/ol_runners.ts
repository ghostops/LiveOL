import { integer, pgTable, varchar, json } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { LiveResultsTable } from './live_results';
import { relations } from 'drizzle-orm';
import { OLOrganizationsTable } from './ol_organizations';
import { EventorStartTable } from './eventor_start';
import { EventorResultsTable } from './eventor_results';
import { EventorSignupsTable } from './eventor_signups';

export const OLRunnersTable = pgTable('ol_runners', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveName: varchar({ length: 255 }),
  eventorName: varchar({ length: 255 }),
  punchCardNumbers: json().$type<string[]>().default([]),
  olOrganizationId: integer(),
  ...commonFields,
});

export const OLRunnersRelations = relations(
  OLRunnersTable,
  ({ one, many }) => ({
    olUser: one(OLOrganizationsTable, {
      fields: [OLRunnersTable.olOrganizationId],
      references: [OLOrganizationsTable.id],
    }),
    eventorStart: many(EventorStartTable),
    eventorResult: many(EventorResultsTable),
    eventorSignups: many(EventorSignupsTable),
    liveResults: many(LiveResultsTable),
  }),
);
