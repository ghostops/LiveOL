import { GQLContext } from 'lib/server';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} from 'graphql';
import {
  marshallResult,
  IOLResult,
  OLResult,
  OLSplitControl,
  IOLSplitControl,
  marshallSplitControl,
} from 'schema/results';
import { sortOptimal } from 'lib/liveresultat/sorting';

export const ResultsQuery = new GraphQLObjectType({
  name: 'ResultsQuery',
  fields: () => ({
    getResults: {
      args: {
        competitionId: {
          type: GraphQLInt,
        },
        className: {
          type: GraphQLString,
        },
        sorting: {
          type: GraphQLString,
          defaultValue: 'place:asc',
        },
      },
      type: new GraphQLList(OLResult),
      resolve: async (
        x,
        args,
        { Liveresultat }: GQLContext,
      ): Promise<IOLResult[]> => {
        if (!args.competitionId || !args.className) {
          throw new Error('No competition id and/or class name present');
        }

        const res = await Liveresultat.getclassresults(
          args.competitionId,
          args.className,
        );

        const sorted = sortOptimal(res.results, args.sorting);

        return sorted.map(
          marshallResult(args.competitionId, args.className, res.splitcontrols),
        );
      },
    },
    getSplitControls: {
      args: {
        competitionId: {
          type: GraphQLInt,
        },
        className: {
          type: GraphQLString,
        },
      },
      type: new GraphQLList(OLSplitControl),
      resolve: async (
        _,
        args,
        { Liveresultat }: GQLContext,
      ): Promise<IOLSplitControl[]> => {
        if (!args.competitionId || !args.className) {
          throw new Error('No competition id and/or class name present');
        }

        const res = await Liveresultat.getclassresults(
          args.competitionId,
          args.className,
        );

        return res.splitcontrols.map(marshallSplitControl);
      },
    },
    getClubResults: {
      args: {
        competitionId: {
          type: GraphQLInt,
        },
        clubName: {
          type: GraphQLString,
        },
        sorting: {
          type: GraphQLString,
          defaultValue: 'place:asc',
        },
      },
      type: new GraphQLList(OLResult),
      resolve: async (
        _,
        args,
        { Liveresultat }: GQLContext,
      ): Promise<IOLResult[]> => {
        if (!args.competitionId || !args.clubName) {
          throw new Error('No competition id and/or club name present');
        }

        const res = await Liveresultat.getclubresults(
          args.competitionId,
          args.clubName,
        );

        const sorted = sortOptimal(res.results, args.sorting);

        return sorted.map(result =>
          marshallResult(args.competitionId, result.class, [])(result),
        );
      },
    },
  }),
});
