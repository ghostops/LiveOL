import { pgTable, varchar } from 'drizzle-orm/pg-core';
import { commonFields } from './commonFields';
import { boolean } from 'drizzle-orm/pg-core';

export const ServiceStatusTable = pgTable('service_status', {
  id: varchar().primaryKey(),
  status: boolean().notNull().default(true),
  ...commonFields,
});
