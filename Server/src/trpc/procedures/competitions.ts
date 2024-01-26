import { isDateToday } from 'lib/helpers/time';
import * as _ from 'lodash';
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
		const page: number = input.cursor ? (input.cursor < 1 ? 1 : input.cursor) : 1;
		const search: string = input.search || null;

		const PER_PAGE = 50;
		const offset = (page - 1) * PER_PAGE;

		let { competitions } = await ctx.Liveresultat.getcompetitions();

		const lastPage = Math.ceil(competitions.length / PER_PAGE);

		if (search) {
			competitions = competitions.filter((comp) => comp.name.toLowerCase().includes(search.toLowerCase()));
		}

		competitions = _.drop(competitions, offset).slice(0, PER_PAGE);

		return {
			page,
			search,
			lastPage,
			nextPage: Math.min(page + 1, lastPage),
			competitions: competitions.map(marshallCompetition(null)),
		};
	});

export const getTodaysCompetitions = publicProcedure
	.input(
		z.object({
			date: z.string(),
		}),
	)
	.query(async ({ ctx, input }) => {
		let { competitions } = await ctx.Liveresultat.getcompetitions();

		const today = competitions.filter((comp) => {
			return isDateToday(comp.date, input.date);
		});

		return {
			today: today.map(marshallCompetition(null)),
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

		const liveresultatComp = await ctx.Liveresultat.getcompetition(input.competitionId);
		const eventorComp = await ctx.Eventor.getEventorData(liveresultatComp);

		const { classes } = await ctx.Liveresultat.getclasses(input.competitionId);

		return {
			competition: marshallCompetition(eventorComp)(liveresultatComp),
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

		const { passings } = await ctx.Liveresultat.getlastpassings(input.competitionId);

		return passings.map(marshallPassing);
	});
