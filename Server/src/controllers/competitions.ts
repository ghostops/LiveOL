import express from 'express';
import { defaultEndpointsFactory } from 'express-zod-api';
import { isDateToday } from 'lib/helpers/time';
import { marshallClass } from 'lib/marshall/classes';
import { marshallCompetition } from 'lib/marshall/competitions';
import { marshallPassing } from 'lib/marshall/passings';
import { apiSingletons } from 'lib/singletons';
import _ from 'lodash';
import { z } from 'zod/v4';

const router = express.Router();

const api = apiSingletons.createApiSingletons();

const competitionSchema = z.object({
  id: z.number(),
  name: z.string(),
  organizer: z.string(),
  date: z.string(),
  clubLogoSizes: z.string().array(),
  eventorAvailable: z.boolean(),
  eventorUrl: z.string().nullish(),
  info: z.string().nullish(),
  club: z.string().nullish(),
  clubLogoUrl: z.string().nullish(),
  canceled: z.boolean().nullish(),
  distance: z.string().nullish(),
  district: z.string().nullish(),
  signups: z.number().nullish(),
});

export const getCompetitions = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    cursor: z.coerce.number().default(1),
    search: z.string().optional(),
  }),
  output: z.object({
    page: z.number(),
    search: z.string().optional(),
    lastPage: z.number(),
    nextPage: z.number(),
    competitions: z.array(competitionSchema),
  }),
  handler: async ({ input: { cursor, search } }) => {
    const page: number = cursor < 1 ? 1 : cursor;
    const PER_PAGE = 50;
    const offset = (page - 1) * PER_PAGE;

    const { competitions } = await api.Liveresultat.getcompetitions();

    let filtered = competitions;
    if (search) {
      filtered = filtered.filter(comp =>
        comp.name.toLowerCase().includes(search!.toLowerCase()),
      );
    }

    const lastPage = Math.ceil(filtered.length / PER_PAGE);
    const paged = _.drop(filtered, offset).slice(0, PER_PAGE);

    return {
      page,
      search,
      lastPage,
      nextPage: Math.min(page + 1, lastPage),
      competitions: paged.map(marshallCompetition(undefined)),
    };
  },
});

export const getCompetitionsToday = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    date: z.string(),
  }),
  output: z.object({
    today: z.array(competitionSchema),
  }),
  handler: async ({ input: { date } }) => {
    const { competitions } = await api.Liveresultat.getcompetitions();

    const today = competitions.filter(comp => isDateToday(comp.date, date));

    return {
      today: today.map(marshallCompetition(undefined)),
    };
  },
});

export const getCompetition = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    competitionId: z.coerce.number(),
  }),
  output: z.object({
    competition: competitionSchema,
    classes: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        competition: z.number(),
      }),
    ),
  }),
  handler: async ({ input: { competitionId } }) => {
    const liveresultatComp =
      await api.Liveresultat.getcompetition(competitionId);
    const eventorComp = await api.Eventor.getEventorData(liveresultatComp);

    const { classes } = await api.Liveresultat.getclasses(competitionId);

    return {
      competition: marshallCompetition(eventorComp || undefined)(
        liveresultatComp,
      ),
      classes: classes.map(marshallClass(competitionId)),
    };
  },
});

export const getCompetitionLastPassings = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    competitionId: z.coerce.number(),
  }),
  output: z.object({
    passings: z.array(
      z.object({
        id: z.string(),
        class: z.string(),
        control: z.number(),
        controlName: z.string(),
        passtime: z.string(),
        runnerName: z.string(),
        time: z.string(),
        status: z.number(),
      }),
    ),
  }),
  handler: async ({ input: { competitionId } }) => {
    const { passings } = await api.Liveresultat.getlastpassings(competitionId);

    return { passings: passings.map(marshallPassing) };
  },
});

export default router;
