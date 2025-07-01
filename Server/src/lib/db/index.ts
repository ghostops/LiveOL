import {
  drizzle,
  NodePgClient,
  NodePgDatabase,
} from 'drizzle-orm/node-postgres';

type DrizzlePostgresDb = NodePgDatabase<Record<string, never>> & {
  $client: NodePgClient;
};

export class Drizzle {
  public db: DrizzlePostgresDb;

  constructor(url: string) {
    if (!url) {
      throw new Error('DATABASE_URL is not defined');
    }

    this.db = drizzle(url);
  }
}
