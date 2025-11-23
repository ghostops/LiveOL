import { sql } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import { noOrganizationId } from 'lib/match/generateIds';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getAllOrganizations = defaultEndpointsFactory.build({
  method: 'get',
  output: z.object({
    organizations: z
      .object({
        id: z.string(),
        title: z.string(),
      })
      .array(),
  }),
  handler: async () => {
    const cacheKey = 'cache:all_organizations';
    const cached = await api.Redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

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
        GROUP BY "olOrganizationId"
        ORDER BY MIN("organization");
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
