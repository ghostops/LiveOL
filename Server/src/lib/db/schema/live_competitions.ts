import {
  integer,
  pgTable,
  varchar,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { index } from 'drizzle-orm/pg-core';

export const LiveCompetitionsTable = pgTable(
  'live_competitions',
  {
    id: integer().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    organizer: varchar({ length: 255 }),
    olOrganizationId: varchar({ length: 255 }).notNull(),
    date: timestamp().notNull(),
    isPublic: boolean().default(true),
    isLive: boolean().default(false),
    olCompetitionId: varchar({ length: 255 }).notNull(),
    ...commonFields,
  },
  t => [
    index('competitions_olOrganizationId_idx').on(t.olOrganizationId),
    index('competitions_olCompetitionId_idx').on(t.olCompetitionId),
    index('competitions_isLive_date_idx').on(t.isLive, t.date),
  ],
);
