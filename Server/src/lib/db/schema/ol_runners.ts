import { integer, pgTable, varchar, json } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLRunnersTable = pgTable('ol_runners', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  liveName: varchar({ length: 255 }),
  eventorName: varchar({ length: 255 }),
  punchCardNumbers: json().$type<string[]>().default([]),
  olOrganizationId: integer(),
  ...commonFields,
});
