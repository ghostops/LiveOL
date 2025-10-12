import { integer, pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLOrganizationsTable = pgTable('ol_organizations', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorId: varchar({ length: 255 }).unique(),
  eventorName: varchar({ length: 255 }),
  liveName: varchar({ length: 255 }),
  logoPath: varchar({ length: 255 }),
  ...commonFields,
});
