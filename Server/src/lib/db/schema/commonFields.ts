import { timestamp } from 'drizzle-orm/pg-core';

export const commonFields = {
  createdAt: timestamp().defaultNow(),
  updatedAt: timestamp().defaultNow(),
};
