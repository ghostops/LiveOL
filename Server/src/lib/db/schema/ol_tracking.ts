import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { OLUsersTable } from './ol_users';
import { boolean } from 'drizzle-orm/pg-core';

export const OLTrackingTable = pgTable('ol_tracking', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  olUserId: integer()
    .notNull()
    .references(() => OLUsersTable.id, { onDelete: 'cascade' }),
  name: varchar({ length: 255 }).notNull(),
  clubs: varchar({ length: 255 }).array().notNull().default([]),
  isMe: boolean().notNull().default(false),
  ...commonFields,
});
