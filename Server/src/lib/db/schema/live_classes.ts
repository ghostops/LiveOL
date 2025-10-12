import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const LiveClassesTable = pgTable('live_classes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveClassId: varchar({ length: 255 }).notNull().unique(),
  liveCompetitionId: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }),
  ...commonFields,
});
