import {
  integer,
  pgTable,
  timestamp,
  varchar,
  decimal,
  text,
} from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { json } from 'drizzle-orm/pg-core';

export const EventorCompetitionsTable = pgTable('eventor_competitions', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  eventorId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  organizer: varchar({ length: 255 }),
  olOrganizerId: varchar({ length: 255 }),
  status: varchar({ length: 255 }),
  date: timestamp(),
  distance: varchar({ length: 255 }),
  punchSystem: varchar({ length: 255 }),
  lat: decimal({ precision: 8, scale: 6 }),
  lng: decimal({ precision: 9, scale: 6 }),
  notification: text(),
  links: json().$type<{ href: string; text: string }[]>(),
  ...commonFields,
});
