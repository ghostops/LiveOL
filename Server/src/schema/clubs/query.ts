import { GQLContext } from 'lib/server';
import {
  GraphQLObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} from 'graphql';
import { OLClub, IOLClub, marshallClub } from 'schema/clubs';

export const ClubsQuery = new GraphQLObjectType({
  name: 'ClubsQuery',
  fields: () => ({
    getClubById: {
      args: {
        clubId: {
          type: GraphQLInt,
        },
      },
      type: OLClub,
      resolve: async (
        _,
        args,
        { Eventor }: GQLContext,
      ): Promise<IOLClub | null> => {
        if (!args.clubId) {
          throw new Error('No club id present');
        }

        const clubs = await Eventor.getClubs();

        const club = clubs.find(c => c.id === args.clubId);

        return marshallClub(club);
      },
    },
    getClubByName: {
      args: {
        clubName: {
          type: GraphQLString,
        },
      },
      type: new GraphQLList(OLClub),
      resolve: async (_, args, { Eventor }: GQLContext): Promise<IOLClub[]> => {
        if (!args.clubName) {
          throw new Error('No club name present');
        }

        const clubs = await Eventor.getClubs();

        const clubIds: number[] = [];
        const filtered = clubs.filter(c => {
          const existsInArg = c.name
            .toLowerCase()
            .includes(args.clubName.toLowerCase());

          if (existsInArg) {
            if (clubIds.includes(c.id)) {
              return false;
            }

            clubIds.push(c.id);
          }

          return existsInArg;
        });

        return filtered.map(marshallClub) as IOLClub[];
      },
    },
    getAllClubs: {
      type: new GraphQLList(OLClub),
      resolve: async (_, args, { Eventor }: GQLContext): Promise<IOLClub[]> => {
        const clubs = await Eventor.getClubs();

        return clubs.map(marshallClub) as IOLClub[];
      },
    },
  }),
});
