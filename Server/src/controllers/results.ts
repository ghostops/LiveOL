import { z } from 'zod/v4';
import { sortOptimal } from 'lib/liveresultat/sorting';
import { marshallResult, marshallSplitControl } from 'lib/marshall/results';
import { apiSingletons } from 'lib/singletons';
import { defaultEndpointsFactory } from 'express-zod-api';

const api = apiSingletons.createApiSingletons();

const splitSchema = z.object({
  id: z.string(),
  code: z.number(),
  name: z.string(),
  status: z.number(),
  place: z.number(),
  time: z.string(),
  timeplus: z.string(),
});

const resultSchema = z.object({
  id: z.string(),
  splits: z.array(splitSchema),
  hasSplits: z.boolean(),
  place: z.string().optional(),
  name: z.string(),
  club: z.string().optional(),
  class: z.string().optional(),
  status: z.number(),
  start: z.string(),
  startTime: z.number(),
  result: z.string().optional(),
  timeplus: z.string(),
  progress: z.number(),
  hasUpdated: z.boolean(),
});

export const getResultsForClass = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    competitionId: z.coerce.number(),
    className: z.string(),
    sorting: z.string().optional(),
    nowTimestamp: z.coerce.number(),
  }),
  output: z.object({
    hash: z.string(),
    results: z.array(resultSchema),
  }),
  handler: async ({
    input: { className, competitionId, nowTimestamp, sorting },
  }) => {
    const result = await api.Liveresultat.getclassresults(
      competitionId,
      className,
    );

    const sorted = sortOptimal(
      result.results,
      sorting || 'place:asc',
      nowTimestamp,
    );

    const marshalledResults = sorted.map(
      marshallResult(competitionId, className, result.splitcontrols),
    );

    return {
      results: marshalledResults,
      hash: result.hash,
    };
  },
});

export const getResultsForClub = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    competitionId: z.coerce.number(),
    clubName: z.string(),
  }),
  output: z.object({
    results: z.array(resultSchema),
  }),
  handler: async ({ input: { clubName, competitionId } }) => {
    const result = await api.Liveresultat.getclubresults(
      competitionId,
      clubName,
    );

    const marshalled = result.results.map(r =>
      marshallResult(competitionId, r.class, [])(r),
    );

    return {
      results: marshalled,
    };
  },
});

export const getSplitControls = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    competitionId: z.coerce.number(),
    className: z.string(),
  }),
  output: z.object({
    splits: z.array(
      z.object({
        id: z.string(),
        code: z.number(),
        name: z.string(),
      }),
    ),
  }),
  handler: async ({ input: { competitionId, className } }) => {
    const result = await api.Liveresultat.getclassresults(
      competitionId,
      className,
    );

    return {
      splits: result.splitcontrols.map(marshallSplitControl),
    };
  },
});
