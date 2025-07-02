import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { relations } from 'drizzle-orm';
import { OLRunnersTable } from './ol_runners';
import { OLTrackingTable } from './ol_tracking';

export const OLUsersTable = pgTable('ol_users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deviceId: varchar({ length: 255 }).notNull().unique(),
  language: varchar({ length: 16 }).notNull().default('en'),
  olRunnerId: integer(),
  ...commonFields,
});

export const OLUsersRelations = relations(OLUsersTable, ({ one, many }) => ({
  olRunner: one(OLRunnersTable, {
    fields: [OLUsersTable.olRunnerId],
    references: [OLRunnersTable.id],
  }),
  olTracking: many(OLTrackingTable),
}));
