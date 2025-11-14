import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { index } from 'drizzle-orm/pg-core';

export const LiveResultsTable = pgTable(
  'live_results',
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    liveResultId: varchar({ length: 255 }).notNull().unique(),
    liveClassId: varchar({ length: 255 }).notNull(),
    liveCompetitionId: integer().notNull(),
    olRunnerId: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    organization: varchar({ length: 255 }),
    olOrganizationId: varchar({ length: 255 }).notNull(),
    result: integer(),
    timeplus: integer(),
    progress: integer().default(0),
    status: integer(),
    place: varchar({ length: 255 }),
    start: integer(),
    ...commonFields,
  },
  t => [
    index('results_olRunnerId_idx').on(t.olRunnerId),
    index('results_olOrganizationId_idx').on(t.olOrganizationId),
  ],
);
