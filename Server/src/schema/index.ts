import { GraphQLSchema, GraphQLObjectType } from 'graphql';
import { CompetitionsQuery } from 'schema/competitions/query';
import { LastPassingsQuery } from 'schema/lastPassings/query';
import { ResultsQuery } from 'schema/results/query';
import { ServerQuery } from 'schema/server/query';

const query = new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        competitions: { type: CompetitionsQuery, resolve: () => true },
        lastPassings: { type: LastPassingsQuery, resolve: () => true },
        results: { type: ResultsQuery, resolve: () => true },
        server: { type: ServerQuery, resolve: () => true },
    }),
})

export const schema = new GraphQLSchema({
    query,
});
