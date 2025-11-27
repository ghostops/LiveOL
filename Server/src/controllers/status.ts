import { z } from 'zod/v4';
import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { ServiceStatusTable } from 'lib/db/schema';
import { LiveresultatUrl } from 'lib/eventor/scrapers/urls';
import { eq } from 'drizzle-orm';

const api = apiSingletons.createApiSingletons();

export const getServerStatus = defaultEndpointsFactory.build({
  method: 'get',
  output: z.object({
    status: z.string(),
  }),
  handler: async () => {
    const isDbHealthy = await api.Drizzle.db
      .execute('SELECT 1')
      .then(() => true)
      .catch(() => false);

    if (!isDbHealthy) {
      throw new Error('Database is not healthy');
    }

    const isCacheHealthy = await api.Redis.ping()
      .then(() => true)
      .catch(() => false);

    if (!isCacheHealthy) {
      throw new Error('Cache is not healthy');
    }

    return {
      status: 'healthy',
    };
  },
});

export const getApiStatus = defaultEndpointsFactory.build({
  method: 'get',
  output: z.object({
    status: z.object({
      liveresultat: z.boolean(),
    }),
  }),
  handler: async () => {
    const [liveresultatStatus] = await api.Drizzle.db
      .select()
      .from(ServiceStatusTable)
      .where(eq(ServiceStatusTable.id, LiveresultatUrl))
      .limit(1);

    return {
      status: {
        liveresultat: liveresultatStatus?.status || false,
      },
    };
  },
});
