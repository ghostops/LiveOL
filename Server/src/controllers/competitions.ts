import express from 'express';
import { isDateToday } from 'lib/helpers/time';
import { marshallClass } from 'lib/marshall/classes';
import { marshallCompetition } from 'lib/marshall/competitions';
import { marshallPassing } from 'lib/marshall/passings';
import { apiSingletons } from 'lib/singletons';
import _ from 'lodash';
import { z } from 'zod';

const router = express.Router();

const api = apiSingletons.createApiSingletons();

router.get('/', async (req, res, next) => {
  try {
    const schema = z.object({
      cursor: z.coerce.number().default(1),
      search: z.string().optional(),
    });
    const input = schema.parse(req.query);

    const page: number = input.cursor < 1 ? 1 : input.cursor;
    const PER_PAGE = 50;
    const offset = (page - 1) * PER_PAGE;

    const { competitions } = await api.Liveresultat.getcompetitions();

    let filtered = competitions;
    if (input.search) {
      filtered = filtered.filter(comp =>
        comp.name.toLowerCase().includes(input.search!.toLowerCase()),
      );
    }

    const lastPage = Math.ceil(filtered.length / PER_PAGE);
    const paged = _.drop(filtered, offset).slice(0, PER_PAGE);

    res.json({
      page,
      search: input.search,
      lastPage,
      nextPage: Math.min(page + 1, lastPage),
      competitions: paged.map(marshallCompetition(undefined)),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/today', async (req, res, next) => {
  try {
    const schema = z.object({
      date: z.string(),
    });
    const input = schema.parse(req.query);

    const { competitions } = await api.Liveresultat.getcompetitions();

    const today = competitions.filter(comp =>
      isDateToday(comp.date, input.date),
    );

    res.json({
      today: today.map(marshallCompetition(undefined)),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:competitionId', async (req, res, next) => {
  try {
    const schema = z.object({
      competitionId: z.coerce.number(),
    });
    const input = schema.parse(req.params);

    if (!input.competitionId) {
      return res.status(400).json({ error: 'No competition id present' });
    }

    const liveresultatComp = await api.Liveresultat.getcompetition(
      input.competitionId,
    );
    const eventorComp = await api.Eventor.getEventorData(liveresultatComp);

    const { classes } = await api.Liveresultat.getclasses(input.competitionId);

    res.json({
      competition: marshallCompetition(eventorComp || undefined)(
        liveresultatComp,
      ),
      classes: classes.map(marshallClass(input.competitionId)),
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:competitionId/last-passings', async (req, res, next) => {
  try {
    const schema = z.object({
      competitionId: z.coerce.number(),
    });
    const input = schema.parse(req.params);

    if (!input.competitionId) {
      return res.status(400).json({ error: 'No competition id present' });
    }

    const { passings } = await api.Liveresultat.getlastpassings(
      input.competitionId,
    );

    res.json(passings.map(marshallPassing));
  } catch (err) {
    next(err);
  }
});

export default router;
