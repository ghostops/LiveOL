import { eq } from 'drizzle-orm';
import { defaultEndpointsFactory } from 'express-zod-api';
import { trackingTable } from 'lib/db/schema';
import { isDateTodayOrFutureWithin7Days } from 'lib/helpers/time';
import { apiSingletons } from 'lib/singletons';
import { z } from 'zod/v4';
import { resultSchema } from './results';
import { classSchema, competitionSchema } from './competitions';
import { IOLCompetition, marshallCompetition } from 'lib/marshall/competitions';
import { IOLResult, marshallResult } from 'lib/marshall/results';
import { IOLClass, marshallClass } from 'lib/marshall/classes';

const api = apiSingletons.createApiSingletons();

const sanitize = (str: string) => str.toLowerCase().trim();

const runnerSchema = z.object({
  id: z.number(),
  runnerName: z.string(),
  runnerClasses: z.array(z.string()),
  runnerClubs: z.array(z.string()),
});

const resultsSchema = z.object({
  class: classSchema,
  competition: competitionSchema,
  result: resultSchema,
});

export const getTrackedRunners = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    deviceId: z.string(),
  }),
  output: z.object({
    runners: z.array(runnerSchema),
  }),
  handler: async ({ input: { deviceId } }) => {
    const runners = await api.Drizzle.db
      .select()
      .from(trackingTable)
      .where(() => eq(trackingTable.deviceId, deviceId));

    return { runners };
  },
});

export const trackNewRunner = defaultEndpointsFactory.build({
  method: 'post',
  input: z.object({
    runnerName: z.string(),
    runnerClasses: z.array(z.string()),
    runnerClubs: z.array(z.string()),
    deviceId: z.string(),
  }),
  output: z.object({
    runner: runnerSchema,
  }),
  handler: async ({
    input: { deviceId, runnerClasses, runnerClubs, runnerName },
  }) => {
    const res = await api.Drizzle.db
      .insert(trackingTable)
      .values({
        deviceId,
        runnerClasses,
        runnerClubs,
        runnerName,
      })
      .returning();

    return { runner: res[0]! };
  },
});

export const updateTrackedRunner = defaultEndpointsFactory.build({
  method: 'put',
  input: z.object({
    id: z.coerce.number(),
    runnerName: z.string(),
    runnerClasses: z.array(z.string()),
    runnerClubs: z.array(z.string()),
    deviceId: z.string(),
  }),
  output: z.object({
    runner: runnerSchema,
  }),
  handler: async ({
    input: { id, deviceId, runnerClasses, runnerClubs, runnerName },
  }) => {
    const runnerQuery = await api.Drizzle.db
      .select()
      .from(trackingTable)
      .where(eq(trackingTable.id, id));

    if (runnerQuery.length === 0) {
      throw new Error('Runner not found');
    }

    const runner = runnerQuery[0]!;

    if (runner.deviceId !== deviceId) {
      throw new Error('Device ID mismatch');
    }

    const updateQuery = await api.Drizzle.db
      .update(trackingTable)
      .set({
        runnerName,
        runnerClasses,
        runnerClubs,
        deviceId,
      })
      .where(eq(trackingTable.id, id))
      .returning();

    if (updateQuery.length === 0) {
      throw new Error('Updated runner not found');
    }

    const updatedRunner = updateQuery[0]!;

    return { runner: updatedRunner };
  },
});

export const removeTrackedRunner = defaultEndpointsFactory.build({
  method: 'delete',
  input: z.object({
    id: z.coerce.number(),
  }),
  output: z.object({
    success: z.boolean(),
  }),
  handler: async ({ input: { id } }) => {
    try {
      await api.Drizzle.db
        .delete(trackingTable)
        .where(eq(trackingTable.id, id));

      return { success: true };
    } catch (err) {
      console.error('Error removing tracked runner:', err);
      return { success: false };
    }
  },
});

type FoundResults = {
  competition: IOLCompetition;
  class: IOLClass;
  result: IOLResult;
};

export const getTrackedRunner = defaultEndpointsFactory.build({
  method: 'get',
  input: z.object({
    id: z.coerce.number(),
    date: z.string(),
  }),
  output: z.object({
    runner: runnerSchema,
    results: z.array(resultsSchema),
  }),
  handler: async ({ input: { id, date } }) => {
    const runnerQuery = await api.Drizzle.db
      .select()
      .from(trackingTable)
      .where(eq(trackingTable.id, id));

    if (runnerQuery.length === 0) {
      throw new Error('Runner not found');
    }

    const runner = runnerQuery[0]!;

    const { competitions } = await api.LiveresultatLongCache.getcompetitions();
    const futureCompetitions = competitions.filter(comp =>
      isDateTodayOrFutureWithin7Days(comp.date, date),
    );

    const foundResults: FoundResults[] = [];

    for (const comp of futureCompetitions) {
      const { classes } = await api.LiveresultatLongCache.getclasses(comp.id);
      const foundClasses = classes.filter(c =>
        runner.runnerClasses.map(sanitize).includes(sanitize(c.className)),
      );

      for (const c of foundClasses) {
        const { results, splitcontrols } =
          await api.LiveresultatLongCache.getclassresults(comp.id, c.className);

        const runnerResult = results.find(result => {
          return (
            result.name === runner.runnerName &&
            runner.runnerClubs.some(club =>
              result.club
                ? sanitize(result.club).includes(sanitize(club))
                : false,
            )
          );
        });

        if (runnerResult) {
          foundResults.push({
            competition: marshallCompetition(undefined)(comp),
            class: marshallClass(comp.id)(c),
            result: marshallResult(
              comp.id,
              c.className,
              splitcontrols,
            )(runnerResult),
          });

          break;
        }
      }
    }

    return { runner, results: foundResults };
  },
});
