import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLCompetitionsTable = pgTable('ol_competitions', {
  id: varchar({ length: 255 }).primaryKey(),
  ...commonFields,
});
