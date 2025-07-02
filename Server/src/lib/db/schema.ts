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
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  competitionId: integer().notNull(),
  classId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }),
  hash: varchar({ length: 255 }),
});

export const classRelations = relations(classTable, ({ one, many }) => ({
  competition: one(competitionTable, {
    fields: [classTable.competitionId],
    references: [competitionTable.id],
  }),
  results: many(resultTable),
  splitControls: many(splitControlTable),
}));

export const splitControlTable = pgTable('splitControls', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  classId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  code: integer().notNull(),
});

export const splitControlRelations = relations(
  splitControlTable,
  ({ one }) => ({
    class: one(classTable, {
      fields: [splitControlTable.classId],
      references: [classTable.classId],
    }),
  }),
);

export const resultTable = pgTable('results', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  resultId: varchar({ length: 255 }).notNull(),
  classId: varchar({ length: 255 }).notNull(),
  name: varchar({ length: 255 }).notNull(),
  club: varchar({ length: 255 }),
  result: integer(),
  status: integer(),
  timeplus: integer(),
  progress: integer().default(0),
  splits: json().$type<Record<string, string>>(),
  start: integer(),
  place: varchar({ length: 255 }),
});

export const resultRelations = relations(resultTable, ({ one }) => ({
  class: one(classTable, {
    fields: [resultTable.classId],
    references: [classTable.classId],
  }),
}));
