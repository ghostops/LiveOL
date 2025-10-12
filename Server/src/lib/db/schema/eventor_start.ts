import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const EventorStartTable = pgTable('eventor_start', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorClassId: varchar({ length: 255 }).notNull(),
  eventorId: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: integer(),
  olRunnerId: integer(),
  name: varchar({ length: 255 }).notNull(),
  startTime: varchar({ length: 255 }),
  ...commonFields,
});
