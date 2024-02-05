import { TRPCError } from '@trpc/server';
import { isDateToday } from 'lib/helpers/time';
import _ from 'lodash';
import { marshallClass } from 'schema/classes';
import { marshallCompetition } from 'schema/competitions';
import { marshallPassing } from 'schema/lastPassings';
import { publicProcedure } from 'trpc/client';
import { z } from 'zod';

export const getCompetitions = publicProcedure
  .input(
    z.object({
      cursor: z.number(),
      search: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const page: number = input.cursor
      ? input.cursor < 1
        ? 1
        : input.cursor
      : 1;

    const PER_PAGE = 50;
    const offset = (page - 1) * PER_PAGE;

    let { competitions } = await ctx.Liveresultat.getcompetitions();

    if (input.search) {
      competitions = competitions.filter(comp =>
        comp.name.toLowerCase().includes(input.search!.toLowerCase()),
      );
    }

    const lastPage = Math.ceil(competitions.length / PER_PAGE);

    competitions = _.drop(competitions, offset).slice(0, PER_PAGE);

    return {
      page,
      search: input.search,
      lastPage,
      nextPage: Math.min(page + 1, lastPage),
      competitions: competitions.map(marshallCompetition(undefined)),
    };
  });

export const getTodaysCompetitions = publicProcedure
  .input(
    z.object({
      date: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { competitions } = await ctx.Liveresultat.getcompetitions();

    const today = competitions.filter(comp => {
      return isDateToday(comp.date, input.date);
    });

    return {
      today: today.map(marshallCompetition(undefined)),
    };
  });

export const getCompetition = publicProcedure
  .input(
    z.object({
      competitionId: z.number(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!input.competitionId) {
      throw new Error('No competition id present');
    }

    const liveresultatComp = await ctx.Liveresultat.getcompetition(
      input.competitionId,
    );
    const eventorComp = await ctx.Eventor.getEventorData(liveresultatComp);

    const { classes } = await ctx.Liveresultat.getclasses(input.competitionId);

    return {
      competition: marshallCompetition(eventorComp || undefined)(
        liveresultatComp,
      ),
      classes: classes.map(marshallClass(input.competitionId)),
    };
  });

export const getCompetitionLastPassings = publicProcedure
  .input(
    z.object({
      competitionId: z.number(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!input.competitionId) {
      throw new Error('No competition id present');
    }

    const { passings } = await ctx.Liveresultat.getlastpassings(
      input.competitionId,
    );

    return passings.map(marshallPassing);
  });
