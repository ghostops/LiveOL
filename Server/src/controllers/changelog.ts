import { z } from 'zod/v4';
import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { OLChangelogEntriesTable } from 'lib/db/schema';
import { desc, sql } from 'drizzle-orm';

const api = apiSingletons.createApiSingletons();

export const getChangelogEntries = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
  }),
  output: z.object({
    entries: z.array(
      z.object({
        id: z.number(),
        displayOrder: z.number(),
        title: z.string(),
        content: z.string(),
        publishedAt: z.string(),
      }),
    ),
    total: z.number(),
  }),
  handler: async ({ input }) => {
    const entries = await api.Drizzle.db
      .select()
      .from(OLChangelogEntriesTable)
      .where(sql`${OLChangelogEntriesTable.publishedAt} IS NOT NULL`)
      .orderBy(desc(OLChangelogEntriesTable.displayOrder))
      .limit(input.limit)
      .offset(input.offset);

    const [countResult] = await api.Drizzle.db
      .select({ count: sql<number>`count(*)` })
      .from(OLChangelogEntriesTable)
      .where(sql`${OLChangelogEntriesTable.publishedAt} IS NOT NULL`);

    return {
      entries: entries.map(entry => ({
        ...entry,
        publishedAt: entry.publishedAt?.toISOString() || '',
      })),
      total: countResult?.count ? Number(countResult.count) : 0,
    };
  },
});
