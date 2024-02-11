import { sortOptimal } from 'lib/liveresultat/sorting';
import { marshallResult, marshallSplitControl } from 'lib/marshall/results';
import { publicProcedure } from 'trpc/client';
import { z } from 'zod';

export const getResults = publicProcedure
  .input(
    z.object({
      competitionId: z.number(),
      className: z.string(),
      sorting: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!input.competitionId || !input.className) {
      throw new Error('No competition id and/or class name present');
    }

    const res = await ctx.Liveresultat.getclassresults(
      input.competitionId,
      input.className,
    );

    const sorted = sortOptimal(res.results, input.sorting || 'place:asc');

    return {
      results: sorted.map(
        marshallResult(input.competitionId, input.className, res.splitcontrols),
      ),
      hash: res.hash,
    };
  });

export const getClubResults = publicProcedure
  .input(
    z.object({
      competitionId: z.number(),
      sorting: z.string().optional(),
      clubName: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!input.competitionId || !input.clubName) {
      throw new Error('No competition id and/or club name present');
    }

    const res = await ctx.Liveresultat.getclubresults(
      input.competitionId,
      input.clubName,
    );

    return res.results.map(result =>
      marshallResult(input.competitionId, result.class, [])(result),
    );
  });

export const getSplitControls = publicProcedure
  .input(
    z.object({
      competitionId: z.number(),
      className: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!input.competitionId || !input.className) {
      throw new Error('No competition id and/or class name present');
    }

    const res = await ctx.Liveresultat.getclassresults(
      input.competitionId,
      input.className,
    );

    return res.splitcontrols.map(marshallSplitControl);
  });
