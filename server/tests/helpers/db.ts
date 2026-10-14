import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { sql } from 'drizzle-orm';
import path from 'path';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

/**
 * A real Postgres (PGlite — Postgres compiled to WASM) with the project's own
 * drizzle migrations applied. No docker, no service, no OS user, so this runs
 * in CI unchanged.
 *
 * The production code is typed against `NodePgDatabase`. PGlite's driver builds
 * the same queries against the same dialect, so the handle is cast once here
 * rather than loosening the production types.
 */
export type TestDb = NodePgDatabase<Record<string, never>>;

const MIGRATIONS = path.join(__dirname, '..', '..', 'drizzle');

export const createTestDb = async () => {
  const client = new PGlite();
  const db = drizzle(client);
  await migrate(db, { migrationsFolder: MIGRATIONS });

  return {
    db: db as unknown as TestDb,
    /** Empties every table so each test starts from a known state. */
    reset: async () => {
      const tables = await db.execute<{ tablename: string }>(sql`
        SELECT tablename FROM pg_tables
        WHERE schemaname = 'public' AND tablename <> '__drizzle_migrations'
      `);
      const names = tables.rows.map(r => `"${r.tablename}"`).join(', ');
      if (names) {
        await db.execute(sql.raw(`TRUNCATE ${names} RESTART IDENTITY CASCADE`));
      }
    },
    close: () => client.close(),
  };
};
