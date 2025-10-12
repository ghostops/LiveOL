import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const EventorClassesTable = pgTable('eventor_classes', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorClassId: varchar({ length: 255 }).notNull().unique(),
  eventorId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  ...commonFields,
});
