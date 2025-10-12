import {
  integer,
  pgTable,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const LiveCompetitionsTable = pgTable('live_competitions', {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  organizer: varchar({ length: 255 }),
  olOrganizationId: varchar({ length: 255 }).notNull(),
  date: timestamp().notNull(),
  isPublic: boolean().default(true),
  olCompetitionId: varchar({ length: 255 }).notNull(),
  ...commonFields,
});
