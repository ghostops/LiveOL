import { Drizzle } from '../../../../server/src/lib/db';
import dotenv from 'dotenv';
import { resolve } from 'path';

let dbInstance: Drizzle | null = null;

export const getDatabase = (): Drizzle => {
  if (dbInstance) return dbInstance;

  // Load environment
  const serverEnvPath = resolve(__dirname, '../../../../server/.env.local');
  dotenv.config({ path: serverEnvPath });

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      'DATABASE_URL not found. Ensure server/.env exists with DATABASE_URL',
    );
  }

  dbInstance = new Drizzle(dbUrl);
  return dbInstance;
};
