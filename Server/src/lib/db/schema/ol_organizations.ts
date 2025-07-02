import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { EventorStartTable } from './eventor_start';
import { EventorResultsTable } from './eventor_results';
import { EventorSignupsTable } from './eventor_signups';
import { LiveResultsTable } from './live_results';

export const OLOrganizationsTable = pgTable('ol_organizations', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorId: integer().notNull().unique(),
  eventorName: varchar({ length: 255 }).notNull(),
  liveName: varchar({ length: 255 }),
  logoPath: varchar({ length: 255 }),
  ...commonFields,
});

export const OLOrganizationsRelations = relations(
  OLOrganizationsTable,
  ({ many }) => ({
    eventorStart: many(EventorStartTable),
    eventorResult: many(EventorResultsTable),
    eventorSignups: many(EventorSignupsTable),
    liveResults: many(LiveResultsTable),
  }),
);
