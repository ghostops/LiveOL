import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { boolean } from 'drizzle-orm/pg-core';

export const OLUsersTable = pgTable('ol_users', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  uid: varchar({ length: 128 }).notNull().unique(),
  deviceId: varchar({ length: 255 }).notNull().unique(),
  hasPlus: boolean().notNull().default(false),
  language: varchar({ length: 16 }).notNull().default('en'),
  ...commonFields,
});
