import { defaultEndpointsFactory } from 'express-zod-api';
import { PlusCodeHandler } from 'lib/plusCodes/validator';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';

const plusCodeSchema = z.object({
  code: z.string(),
  deviceId: z.string(),
});

const api = apiSingletons.createApiSingletons();

export const validatePlusCode = defaultEndpointsFactory.build({
  method: 'get',
  input: plusCodeSchema,
  output: z.object({
    result: z.boolean(),
  }),
  handler: async ({ input: { code, deviceId } }) => {
    const handler = new PlusCodeHandler(api.Redis);
    const hasPlus = await handler.validatePlusCode(code, deviceId);
    return { result: hasPlus };
  },
});

export const redeemPlusCode = defaultEndpointsFactory.build({
  method: 'get',
  input: plusCodeSchema,
  output: z.object({
    result: z.boolean(),
  }),
  handler: async ({ input: { code, deviceId } }) => {
    const handler = new PlusCodeHandler(api.Redis);
    await handler.redeemPlusCode(code, deviceId);
    const hasPlus = await handler.validatePlusCode(code, deviceId);
    return { result: hasPlus };
  },
});
