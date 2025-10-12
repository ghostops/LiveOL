import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLCompetitionsTable = pgTable('ol_competitions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveId: integer().unique(),
  eventorId: varchar({ length: 255 }).unique(),
  ...commonFields,
});
