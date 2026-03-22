import { index, integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const LiveSplitControllsTable = pgTable(
  'live_split_controlls',
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    liveClassId: varchar({ length: 255 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 255 }).notNull(),
    order: integer(),
    ...commonFields,
  },
  t => [index('live_split_controlls_liveClassId_idx').on(t.liveClassId)],
);
