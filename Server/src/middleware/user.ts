import { Middleware } from 'express-zod-api';
import createHttpError from 'http-errors';
import { apiSingletons } from 'lib/singletons';
import { OLUsersTable } from 'lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';

const api = apiSingletons.createApiSingletons();

export const userMiddleware = new Middleware({
  input: z.object({
    uid: z.string().min(1),
  }),
  handler: async ({ input: { uid } }) => {
    const [user] = await api.Drizzle.db
      .select()
      .from(OLUsersTable)
      .where(eq(OLUsersTable.uid, uid))
      .limit(1);
    if (!user) throw createHttpError(401, 'Invalid uid');
    return { user }; // provides endpoints with options.user
  },
});
