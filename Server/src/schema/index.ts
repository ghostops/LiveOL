import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { CompetitionsQuery } from './competitions/query';

const query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        competitions: { type: CompetitionsQuery, resolve: () => true },
    }),
})

export const schema = new GraphQLSchema({
    query,
});
