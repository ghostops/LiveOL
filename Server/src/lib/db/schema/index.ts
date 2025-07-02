import { integer, pgTable, varchar, json } from 'drizzle-orm/pg-core';

export * from './ol_competitions';
export * from './ol_users';
export * from './ol_tracking';
export * from './ol_runners';
export * from './ol_organizations';
export * from './eventor_classes';
export * from './eventor_competitions';
export * from './eventor_signups';
export * from './eventor_results';
export * from './eventor_start';
export * from './live_classes';
export * from './live_competitions';
export * from './live_results';
export * from './live_split_controlls';
export * from './live_split_results';

export const trackingTable = pgTable('tracking', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deviceId: varchar({ length: 255 }).notNull(),
  runnerName: varchar({ length: 255 }).notNull(),
  runnerClubs: json().notNull().$type<string[]>(),
  runnerClasses: json().notNull().$type<string[]>(),
});
