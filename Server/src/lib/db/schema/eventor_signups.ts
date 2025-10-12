import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const EventorSignupsTable = pgTable('eventor_signups', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  signupId: varchar({ length: 64 }).notNull().unique(),
  eventorClassId: varchar({ length: 255 }).notNull(),
  eventorId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  organization: varchar({ length: 255 }),
  olOrganizationId: varchar({ length: 255 }).notNull(),
  olRunnerId: varchar({ length: 255 }).notNull(),
  punchCardNumber: varchar({ length: 255 }),
  ...commonFields,
});
