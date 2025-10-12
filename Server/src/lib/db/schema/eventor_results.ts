import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const EventorResultsTable = pgTable('eventor_results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  resultId: varchar({ length: 255 }).notNull().unique(),
  eventorClassId: varchar({ length: 255 }).notNull(),
  eventorId: varchar({ length: 255 }).notNull(),
  place: varchar({ length: 255 }),
  name: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: varchar({ length: 255 }).notNull(),
  olRunnerId: varchar({ length: 255 }).notNull(),
  time: integer(),
  timePlus: integer(),
  status: varchar({ length: 255 }),
  distanceInMeters: integer(),
  ...commonFields,
});
