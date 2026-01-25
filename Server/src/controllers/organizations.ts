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

    const searchCondition = search
      ? sql`AND "organization" ILIKE ${`%${search}%`}`
      : sql``;

    // Prioritize exact matches in ORDER BY when searching
    const orderByClause = search
      ? sql`
        ORDER BY 
          CASE 
            WHEN LOWER("organization") = LOWER(${search}) THEN 0
            WHEN LOWER("organization") LIKE LOWER(${search}) || '%' THEN 1
            ELSE 2
          END,
          MIN("organization") COLLATE "C"
        `
      : sql`ORDER BY MIN("organization") COLLATE "C"`;

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
        ${orderByClause}
        LIMIT ${limit};
      `,
    );

    return {
      organizations: organizations.rows.map(org => ({
        id: org.olOrganizationId,
        title: org.organization!,
      })),
    };
  },
});
