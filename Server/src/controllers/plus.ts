import express from 'express';
import { PlusCodeHandler } from 'lib/plusCodes/validator';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod';

const router = express.Router();

const plusCodeSchema = z.object({
  code: z.string(),
  deviceId: z.string(),
});

const api = apiSingletons.createApiSingletons();

router.post('/validate', async (req, res, next) => {
  try {
    const parseResult = plusCodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }
    const { code, deviceId } = parseResult.data;
    const handler = new PlusCodeHandler(api.Redis);
    const hasPlus = await handler.validatePlusCode(code, deviceId);
    res.json({ result: hasPlus });
  } catch (error) {
    next(error);
  }
});

router.post('/redeem', async (req, res, next) => {
  try {
    const parseResult = plusCodeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors });
    }
    const { code, deviceId } = parseResult.data;
    const handler = new PlusCodeHandler(api.Redis);
    await handler.redeemPlusCode(code, deviceId);
    const hasPlus = await handler.validatePlusCode(code, deviceId);
    res.json({ result: hasPlus });
  } catch (error) {
    next(error);
  }
});

export default router;
