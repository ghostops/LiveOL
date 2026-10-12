import {
  index,
  integer,
  pgTable,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { OLUsersTable } from './ol_users';

export const OLPushTokensTable = pgTable(
  'ol_push_tokens',
  {
    id: integer().primaryKey().generatedByDefaultAsIdentity(),
    olUserId: integer()
      .notNull()
      .references(() => OLUsersTable.id, { onDelete: 'cascade' }),
    token: varchar({ length: 512 }).notNull().unique(),
    platform: varchar({ length: 16 }).notNull(),
    permissionStatus: varchar({ length: 32 }).notNull(),
    lastSeenAt: timestamp().defaultNow().notNull(),
    ...commonFields,
  },
  t => [index('push_tokens_olUserId_idx').on(t.olUserId)],
);
