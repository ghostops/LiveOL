import { z } from 'zod/v4';
import { defaultEndpointsFactory } from 'express-zod-api';
import { apiSingletons } from 'lib/singletons';
import { OLUsersTable } from 'lib/db/schema/ol_users';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import createHttpError from 'http-errors';

const api = apiSingletons.createApiSingletons();

const registerUserSchema = z.object({
  deviceId: z.string().min(1).max(100).trim(),
  language: z
    .string()
    .min(2)
    .max(16)
    .regex(/^[a-zA-Z]{2,3}(-[a-zA-Z]{2,3})?$/, 'Invalid language code format')
    .optional()
    .default('en'),
  hasPlus: z.boolean().optional().default(false),
});

const userResponseSchema = z.object({
  uid: z.nanoid(),
  hasPlus: z.boolean(),
  language: z.string(),
});

export const registerUser = defaultEndpointsFactory.build({
  method: 'post',
  input: registerUserSchema,
  output: userResponseSchema,
  handler: async ({ input }) => {
    const { deviceId, language, hasPlus } = input;

    // Check if user already exists
    const existingUser = await api.Drizzle.db
      .select()
      .from(OLUsersTable)
      .where(eq(OLUsersTable.deviceId, deviceId))
      .limit(1);

    if (existingUser.length > 0) {
      // User exists - update if language or hasPlus changed
      const user = existingUser[0];
      if (!user) {
        throw createHttpError(404, 'User not found');
      }

      const needsUpdate =
        user.language !== language || user.hasPlus !== hasPlus;

      if (needsUpdate) {
        const [updatedUser] = await api.Drizzle.db
          .update(OLUsersTable)
          .set({
            language,
            hasPlus,
            updatedAt: new Date(),
          })
          .where(eq(OLUsersTable.deviceId, deviceId))
          .returning();

        if (!updatedUser) {
          throw createHttpError(500, 'Failed to update user');
        }

        return updatedUser;
      }

      // No update needed, return existing user
      return user;
    }

    // Create new user
    const [newUser] = await api.Drizzle.db
      .insert(OLUsersTable)
      .values({
        deviceId,
        language,
        hasPlus,
        uid: nanoid(),
      })
      .returning({
        uid: OLUsersTable.uid,
        hasPlus: OLUsersTable.hasPlus,
        language: OLUsersTable.language,
      });

    if (!newUser) {
      throw createHttpError(500, 'Failed to create user');
    }

    return newUser;
  },
});
