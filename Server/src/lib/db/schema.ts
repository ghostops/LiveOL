import { integer, pgTable, varchar, text } from 'drizzle-orm/pg-core';

export const trackingTable = pgTable('tracking', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deviceId: varchar({ length: 255 }).notNull(),
  runnerName: varchar({ length: 255 }).notNull(),
  runnerClubs: text().notNull(),
  runnerClasses: text().notNull(),
});
