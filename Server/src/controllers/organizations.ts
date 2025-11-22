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

    return {
      organizations: organizations.rows.map(org => ({
        id: org.olOrganizationId,
        title: org.organization!,
      })),
    };
  },
});
