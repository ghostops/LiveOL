import { GQLContext } from 'lib/server';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} from 'graphql';
import { OLClass, IOLClass, marshallClass } from 'schema/classes';
import {
  OLCompetition,
  marshallCompetition,
  IOLCompetition,
  IOLCompetitionResponse,
  OLCompetitionResponse,
} from 'schema/competitions';
import { isDateToday } from 'lib/helpers/time';
import * as _ from 'lodash';

export const CompetitionsQuery = new GraphQLObjectType({
  name: 'CompetitionsQuery',
  fields: () => ({
    getAllCompetitions: {
      description: 'We will paginate all future requests',
      deprecationReason: 'pagination',
      type: GraphQLList(OLCompetition),
      resolve: async (
        _,
        args,
        { Liveresultat, userId }: GQLContext,
      ): Promise<IOLCompetition[]> => {
        let { competitions } = await Liveresultat.getcompetitions();
        return competitions.map(marshallCompetition(null));
      },
    },
    getCompetitions: {
      type: OLCompetitionResponse,
      args: {
        page: {
          type: GraphQLInt,
        },
        search: {
          type: GraphQLString,
        },
        date: {
          type: GraphQLString,
        },
      },
      resolve: async (
        x,
        args,
        { Liveresultat, userId }: GQLContext,
      ): Promise<IOLCompetitionResponse> => {
        const page: number = args.page ? (args.page < 1 ? 1 : args.page) : 1;
        const search: string = args.search || null;

        const PER_PAGE = 50;
        const offset = (page - 1) * PER_PAGE;

        let { competitions } = await Liveresultat.getcompetitions();

        const lastPage = Math.ceil(competitions.length / PER_PAGE);

        const today = competitions.filter(comp => {
          return isDateToday(comp.date, args.date);
        });

        if (search) {
          competitions = competitions.filter(comp =>
            comp.name.toLowerCase().includes(search.toLowerCase()),
          );
        }

        competitions = _.drop(competitions, offset).slice(0, PER_PAGE);

        return {
          page,
          search,
          lastPage,
          competitions: competitions.map(marshallCompetition(null)),
          today: today.map(marshallCompetition(null)),
        };
      },
    },
    getCompetition: {
      args: {
        competitionId: {
          type: GraphQLInt,
        },
      },
      type: OLCompetition,
      resolve: async (
        _,
        args,
        { Liveresultat, Eventor }: GQLContext,
      ): Promise<IOLCompetition> => {
        if (!args.competitionId) {
          throw new Error('No competition id present');
        }

        const liveresultatComp = await Liveresultat.getcompetition(
          args.competitionId,
        );
        const eventorComp = await Eventor.getEventorData(liveresultatComp);

        return marshallCompetition(eventorComp)(liveresultatComp);
      },
    },
    getCompetitionClasses: {
      args: {
        competitionId: {
          type: GraphQLInt,
        },
      },
      type: GraphQLList(OLClass),
      resolve: async (
        _,
        args,
        { Liveresultat }: GQLContext,
      ): Promise<IOLClass[]> => {
        if (!args.competitionId) {
          throw new Error('No competition id present');
        }

        const { classes } = await Liveresultat.getclasses(args.competitionId);

        return classes.map(marshallClass(args.competitionId));
      },
    },
  }),
});
