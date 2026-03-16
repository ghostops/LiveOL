import {
  drizzle,
  NodePgClient,
  NodePgDatabase,
} from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

type DrizzlePostgresDb = NodePgDatabase<Record<string, never>> & {
  $client: NodePgClient;
};

export class Drizzle {
  public db: DrizzlePostgresDb;

  constructor(url: string) {
    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    // Create a Pool with explicit UTF-8 encoding
    const pool = new Pool({
      connectionString: url,
      // Ensure UTF-8 encoding for Swedish characters (åäö)
      client_encoding: 'UTF8',
    });

    this.db = drizzle(pool);
  }
}
