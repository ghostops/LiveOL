import { integer, pgTable, varchar, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { date } from 'drizzle-orm/pg-core';

export const trackingTable = pgTable('tracking', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  deviceId: varchar({ length: 255 }).notNull(),
  runnerName: varchar({ length: 255 }).notNull(),
  runnerClubs: json().notNull().$type<string[]>(),
  runnerClasses: json().notNull().$type<string[]>(),
});

export const competitionTable = pgTable('competitions', {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  organizer: varchar({ length: 255 }).notNull(),
  dateString: varchar({ length: 255 }).notNull(),
  date: date(),
  timediff: varchar({ length: 255 }),
  timezone: varchar({ length: 255 }),
  isPublic: integer().notNull().default(1),
});

export const competitionRelations = relations(competitionTable, ({ many }) => ({
  classes: many(classTable),
}));

export const classTable = pgTable('classes', {
  id: varchar({ length: 255 }).primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }),
  hash: varchar({ length: 255 }),
});

export const classRelations = relations(classTable, ({ one, many }) => ({
  competition: one(competitionTable, {
    fields: [classTable.id],
    references: [competitionTable.id],
  }),
  results: many(resultTable),
  splitControls: many(splitControlTable),
}));

export const splitControlTable = pgTable('splitControls', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  classId: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  code: varchar({ length: 255 }).notNull(),
});

export const splitControlRelations = relations(
  splitControlTable,
  ({ one }) => ({
    class: one(classTable, {
      fields: [splitControlTable.classId],
      references: [classTable.id],
    }),
  }),
);

export const resultTable = pgTable('results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  classId: integer().notNull(),
  name: varchar({ length: 255 }).notNull(),
  club: varchar({ length: 255 }),
  result: varchar({ length: 255 }),
  status: varchar({ length: 255 }),
  timeplus: varchar({ length: 255 }),
  progress: integer().default(0),
  splits: json().$type<Record<string, string>>(),
  start: integer(),
});

export const resultRelations = relations(resultTable, ({ one }) => ({
  class: one(classTable, {
    fields: [resultTable.classId],
    references: [classTable.id],
  }),
}));
