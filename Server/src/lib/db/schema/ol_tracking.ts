import { integer, pgTable } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { OLRunnersTable } from './ol_runners';
import { OLUsersTable } from './ol_users';
import { relations } from 'drizzle-orm';

export const OLTrackingTable = pgTable('ol_tracking', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  olUserId: integer().notNull(),
  olRunnerId: integer().notNull(),
  ...commonFields,
});

export const OLTrackingRelations = relations(OLTrackingTable, ({ one }) => ({
  olRunner: one(OLRunnersTable, {
    fields: [OLTrackingTable.olRunnerId],
    references: [OLRunnersTable.id],
  }),
  olUser: one(OLUsersTable, {
    fields: [OLTrackingTable.olUserId],
    references: [OLUsersTable.id],
  }),
}));
