import { sql } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import { noOrganizationId } from 'lib/match/generateIds';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getAllOrganizations = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    search: z.string().optional(),
    limit: z.coerce.number().min(1).max(500).optional().default(100),
  }),
  output: z.object({
    organizations: z
      .object({
        id: z.string(),
        title: z.string(),
      })
      .array(),
  }),
  handler: async ({ input }) => {
    const { search, limit } = input;
    const cacheKey = search
      ? `cache:organizations:search:${search}:${limit}`
      : `cache:all_organizations:${limit}`;
    const cached = await api.Redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Use ILIKE for case-insensitive search that works with åäö
    const searchCondition = search
      ? sql`AND "organization" ILIKE ${`%${search}%`}`
      : sql``;

    const organizations = await api.Drizzle.db.execute<{
      olOrganizationId: string;
      organization: string;
    }>(
      sql`
        SELECT 
          "olOrganizationId",
          MIN("organization") as "organization"
        FROM live_results
        WHERE 
          "organization" IS NOT NULL
          AND "olOrganizationId" != ''
          AND "olOrganizationId" != ${noOrganizationId}
          AND "organization" != ''
          ${searchCondition}
        GROUP BY "olOrganizationId"
        ORDER BY MIN("organization") COLLATE "C"
        LIMIT ${limit};
      `,
    );
    const response = {
      organizations: organizations.rows.map(org => ({
        id: org.olOrganizationId,
        title: org.organization!,
      })),
    };

    api.Redis.set(cacheKey, JSON.stringify(response));
    api.Redis.expire(cacheKey, 3600);

    return response;
  },
});
