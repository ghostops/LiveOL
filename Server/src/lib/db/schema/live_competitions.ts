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
  olOrganizerId: varchar({ length: 255 }),
  date: timestamp().notNull(),
  isPublic: boolean().default(true),
  ...commonFields,
});
