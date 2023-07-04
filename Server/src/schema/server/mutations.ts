import { GraphQLBoolean, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { PlusCodeHandler } from 'lib/plusCodes/validator';
import { GQLContext } from 'lib/server';

export const ServerMutation = new GraphQLObjectType({
	name: 'ServerMutation',
	fields: () => ({
		redeemPlusCode: {
			args: {
				code: {
					type: GraphQLNonNull(GraphQLString),
				},
				deviceId: {
					type: GraphQLNonNull(GraphQLString),
				},
			},
			type: GraphQLBoolean,
			resolve: async (_, args: { code: string; deviceId: string }, { Redis }: GQLContext) => {
				const handler = new PlusCodeHandler(Redis);
				await handler.redeemPlusCode(args.code, args.deviceId);
				const hasPlus = await handler.validatePlusCode(args.code, args.deviceId);
				return hasPlus;
			},
		},
	}),
});
