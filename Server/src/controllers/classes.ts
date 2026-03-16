import { sql } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const getAllClasses = defaultEndpointsFactory.build({
  method: 'get',
  output: z.object({
    classes: z
      .object({
        id: z.string(),
        title: z.string(),
      })
      .array(),
  }),
  handler: async () => {
    const cacheKey = 'cache:all_classes';
    const cached = await api.Redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const classes = await api.Drizzle.db.execute<{ name: string }>(
      sql`
        SELECT 
          name
        FROM live_classes
        WHERE 
          name IS NOT NULL
          AND name != ''
        GROUP BY name
        ORDER BY name;
      `,
    );

    const response = {
      classes: classes.rows.map(cls => ({
        id: cls.name,
        title: cls.name,
      })),
    };

    api.Redis.set(cacheKey, JSON.stringify(response));
    api.Redis.expire(cacheKey, 3600);

    return response;
  },
});
