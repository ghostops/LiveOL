import { apiSingletons } from 'lib/singletons';
import { publicProcedure, router } from './client';
import {
  getCompetitions,
  getTodaysCompetitions,
  getCompetition,
  getCompetitionLastPassings,
} from './procedures/competitions';
import {
  getResults,
  getClubResults,
  getSplitControls,
} from './procedures/results';
import { validatePlusCode, redeemPlusCode } from './procedures/plus';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const serverVersion = require('../../package.json').version;

export const appRouter = router({
  getCompetitions,
  getTodaysCompetitions,
  getCompetition,
  getCompetitionLastPassings,

  getResults,
  getClubResults,
  getSplitControls,

  validatePlusCode,
  redeemPlusCode,

  getServerVersion: publicProcedure.query(async () => {
    return { version: serverVersion };
  }),
});

export const createContext = async () => {
  return apiSingletons.createApiSingletons();
};

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
