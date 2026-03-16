import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLRunnersTable = pgTable('ol_runners', {
  id: varchar({ length: 255 }).primaryKey(),
  ...commonFields,
});
