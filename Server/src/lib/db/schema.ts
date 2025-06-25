import { integer, pgTable, varchar, json } from 'drizzle-orm/pg-core';

export const trackingTable = pgTable('tracking', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deviceId: varchar({ length: 255 }).notNull(),
  runnerName: varchar({ length: 255 }).notNull(),
  runnerClubs: json().notNull().$type<string[]>(),
  runnerClasses: json().notNull().$type<string[]>(),
});
