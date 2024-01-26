import { apiSingletons } from 'lib/singletons';
import { publicProcedure, router } from './client';
import {
	getCompetitions,
	getTodaysCompetitions,
	getCompetition,
	getCompetitionLastPassings,
} from './procedures/competitions';
import { getResults, getClubResults, getSplitControls } from './procedures/results';
import { validatePlusCode, redeemPlusCode } from './procedures/plus';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

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
		return {version: '1.2.3'};
	}),
});

export const createContext = async () => {
	return apiSingletons.createApiSingletons();
};

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
