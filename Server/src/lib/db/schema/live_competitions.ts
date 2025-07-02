import {
  integer,
  pgTable,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { OLCompetitionsTable } from './ol_competitions';
import { OLOrganizationsTable } from './ol_organizations';
import { LiveClassesTable } from './live_classes';

export const LiveCompetitionsTable = pgTable('live_competitions', {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  organizer: varchar({ length: 255 }).notNull(),
  olOrganizerId: integer(),
  date: timestamp().notNull(),
  isPublic: boolean().default(true),
  ...commonFields,
});

export const LiveCompetitionsRelations = relations(
  LiveCompetitionsTable,
  ({ one, many }) => ({
    olCompetition: one(OLCompetitionsTable, {
      fields: [LiveCompetitionsTable.id],
      references: [OLCompetitionsTable.liveId],
    }),
    olOrganizer: one(OLOrganizationsTable, {
      fields: [LiveCompetitionsTable.olOrganizerId],
      references: [OLOrganizationsTable.id],
    }),
    liveClasses: many(LiveClassesTable),
  }),
);
