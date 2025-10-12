import { integer, pgTable } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLTrackingTable = pgTable('ol_tracking', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  olUserId: integer().notNull(),
  olRunnerId: integer().notNull(),
  ...commonFields,
});
