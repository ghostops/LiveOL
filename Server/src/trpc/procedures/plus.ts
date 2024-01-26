import { PlusCodeHandler } from 'lib/plusCodes/validator';
import { publicProcedure } from 'trpc/client';
import { z } from 'zod';

export const validatePlusCode = publicProcedure
	.input(
		z.object({
			code: z.string(),
			deviceId: z.string(),
		}),
	)
	.query(async ({ ctx, input }) => {
		const handler = new PlusCodeHandler(ctx.Redis);
		const hasPlus = await handler.validatePlusCode(input.code, input.deviceId);
		return hasPlus;
	});

export const redeemPlusCode = publicProcedure
	.input(
		z.object({
			code: z.string(),
			deviceId: z.string(),
		}),
	)
	.mutation(async ({ ctx, input }) => {
		const handler = new PlusCodeHandler(ctx.Redis);
		await handler.redeemPlusCode(input.code, input.deviceId);
		const hasPlus = await handler.validatePlusCode(input.code, input.deviceId);
		return hasPlus;
	});
