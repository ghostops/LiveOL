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
    // Sent by app 4.1.0+. Older apps omit it and never see versioned entries
    appVersion: z.string().max(32).optional(),
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
    const published = await api.Drizzle.db
      .select()
      .from(OLChangelogEntriesTable)
      .where(sql`${OLChangelogEntriesTable.publishedAt} IS NOT NULL`)
      .orderBy(desc(OLChangelogEntriesTable.displayOrder));

    const visible = published.filter(entry =>
      isVisibleForAppVersion(entry.minAppVersion, input.appVersion),
    );

    return {
      entries: visible
        .slice(input.offset, input.offset + input.limit)
        .map(entry => ({
          ...entry,
          publishedAt: entry.publishedAt?.toISOString() || '',
        })),
      total: visible.length,
    };
  },
});

const parseVersion = (version: string) =>
  version.split('.').map(part => parseInt(part, 10) || 0);

/** True when appVersion >= minAppVersion. Entries without a minimum are shown to all. */
const isVisibleForAppVersion = (
  minAppVersion: string | null,
  appVersion: string | undefined,
) => {
  if (!minAppVersion) return true;
  if (!appVersion) return false;

  const min = parseVersion(minAppVersion);
  const app = parseVersion(appVersion);
  for (let i = 0; i < Math.max(min.length, app.length); i++) {
    const diff = (app[i] ?? 0) - (min[i] ?? 0);
    if (diff !== 0) return diff > 0;
  }
  return true;
};
