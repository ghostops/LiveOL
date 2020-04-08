import { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList } from 'graphql';
import { EventorClubIconSize, EventorClub, EVENTOR_CLUB_ICON_SIZES } from 'lib/eventor/types';

export interface IOLClub {
    id: number;
    name: string;
    country: string;
    address: string;
    website: string;
    email: string;
    clubLogoUrl: string;
    clubLogoSizes: EventorClubIconSize[];
}

export const marshallClub = (res: EventorClub): IOLClub => {
    if (!res) {
        return null;
    }

    return {
        id: res.id,
        name: res.name,
        address: res.address,
        country: res.country,
        email: res.email,
        website: res.website,
        clubLogoUrl: res.clubLogoUrl,
        clubLogoSizes: EVENTOR_CLUB_ICON_SIZES,
    };
}

export const OLClub = new GraphQLObjectType({
    name: 'OLClub',
    fields: () => ({
        id: {
            type: GraphQLInt,
            resolve: (club: IOLClub) => club.id,
        },
        name: {
            type: GraphQLString,
            resolve: (club: IOLClub) => club.name,
        },
        country: {
            type: GraphQLString,
            resolve: (club: IOLClub) => club.country,
        },
        address: {
            type: GraphQLString,
            resolve: (club: IOLClub) => club.address,
        },
        website: {
            type: GraphQLString,
            resolve: (club: IOLClub) => club.website,
        },
        email: {
            type: GraphQLString,
            resolve: (club: IOLClub) => club.email,
        },
        clubLogoUrl: {
            type: GraphQLString,
            resolve: (club: IOLClub) => club.clubLogoUrl,
        },
        clubLogoSizes: {
            type: new GraphQLList(GraphQLString),
            resolve: (club: IOLClub) => club.clubLogoSizes,
        },
    }),
});
