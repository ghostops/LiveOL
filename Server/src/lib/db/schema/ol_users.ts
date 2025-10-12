import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLUsersTable = pgTable('ol_users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deviceId: varchar({ length: 255 }).notNull().unique(),
  language: varchar({ length: 16 }).notNull().default('en'),
  olRunnerId: integer(),
  ...commonFields,
});
