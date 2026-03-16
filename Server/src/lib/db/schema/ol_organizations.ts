import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLOrganizationsTable = pgTable('ol_organizations', {
  id: varchar({ length: 255 }).primaryKey(),
  ...commonFields,
});
