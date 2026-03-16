import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';

export const OLChangelogEntriesTable = pgTable('ol_changelog_entries', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  displayOrder: integer().notNull(), // Lower = older (1 = onboarding)
  title: varchar({ length: 255 }).notNull(),
  content: text().notNull(), // Markdown content
  publishedAt: timestamp().notNull(),
  ...commonFields,
});
