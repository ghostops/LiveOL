import express from 'express';
import { z } from 'zod';
import { sortOptimal } from 'lib/liveresultat/sorting';
import { marshallResult, marshallSplitControl } from 'lib/marshall/results';
import { apiSingletons } from 'lib/singletons';

const router = express.Router();

const api = apiSingletons.createApiSingletons();

router.get('/:competitionId/class/:className', async (req, res, next) => {
  try {
    const routeSchema = z.object({
      competitionId: z.coerce.number(),
      className: z.string(),
    });
    const querySchema = z.object({
      sorting: z.string().optional(),
      nowTimestamp: z.coerce.number(),
    });
    const routeParams = routeSchema.parse(req.params);
    const queryParams = querySchema.parse(req.query);

    if (!routeParams.competitionId || !routeParams.className) {
      return res
        .status(400)
        .json({ error: 'No competition id and/or class name present' });
    }

    const result = await api.Liveresultat.getclassresults(
      routeParams.competitionId,
      routeParams.className,
    );

    const sorted = sortOptimal(
      result.results,
      queryParams.sorting || 'place:asc',
      queryParams.nowTimestamp,
    );

    const marshalledResults = sorted.map(
      marshallResult(
        routeParams.competitionId,
        routeParams.className,
        result.splitcontrols,
      ),
    );

    res.json({
      results: marshalledResults,
      hash: result.hash,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:competitionId/club/:clubName', async (req, res, next) => {
  try {
    const routeSchema = z.object({
      competitionId: z.coerce.number(),
      clubName: z.string(),
    });
    const routeParams = routeSchema.parse(req.params);

    if (!routeParams.competitionId || !routeParams.clubName) {
      return res
        .status(400)
        .json({ error: 'No competition id and/or club name present' });
    }

    const result = await api.Liveresultat.getclubresults(
      routeParams.competitionId,
      routeParams.clubName,
    );

    const marshalled = result.results.map(r =>
      marshallResult(routeParams.competitionId, r.class, [])(r),
    );

    res.json(marshalled);
  } catch (err) {
    next(err);
  }
});

router.get(
  '/:competitionId/class/:className/splits',
  async (req, res, next) => {
    try {
      const schema = z.object({
        competitionId: z.coerce.number(),
        className: z.string(),
      });
      const input = schema.parse(req.params);

      if (!input.competitionId || !input.className) {
        return res
          .status(400)
          .json({ error: 'No competition id and/or class name present' });
      }

      const result = await api.Liveresultat.getclassresults(
        input.competitionId,
        input.className,
      );

      res.json(result.splitcontrols.map(marshallSplitControl));
    } catch (err) {
      next(err);
    }
  },
);

export default router;
