import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const EventorStartTable = pgTable('eventor_start', {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  startId: varchar({ length: 255 }).notNull(),
  olClassId: varchar({ length: 255 }).notNull(),
  eventorDatabaseId: integer().notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: varchar({ length: 255 }).notNull(),
  olRunnerId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  startTime: varchar({ length: 255 }),
  ...commonFields,
});
