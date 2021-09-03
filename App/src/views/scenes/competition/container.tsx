import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { Routes, RouterProps } from 'lib/nav/routes';
import { OLError } from 'views/components/error';
import { OLCompetition as Component } from './component';
import { GetCompetition, GetCompetitionVariables } from 'lib/graphql/queries/types/GetCompetition';
import { GET_COMPETITION } from 'lib/graphql/queries/competitions';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { Class } from 'lib/graphql/fragments/types/Class';
import _ from 'lodash';

type OwnProps = RouterProps<{ id; title }>;

type Props = OwnProps;

export const OLCompetition: React.FC<Props> = (props) => {
	const competitionId: number = props.route.params.id;

	const { data, loading, error, refetch } = useQuery<GetCompetition, GetCompetitionVariables>(GET_COMPETITION, {
		variables: { competitionId },
	});

	if (error) {
		return <OLError error={error} refetch={refetch} />;
	}

	const competition: Competition = _.get(data, 'competitions.getCompetition', null);
	const classes: Class[] = _.get(data, 'competitions.getCompetitionClasses', null);

	return (
		<Component
			loading={loading}
			competition={competition as any}
			classes={classes}
			goToLastPassings={() => {
				props.navigation.navigate(Routes.passings, {
					id: props.route.params.id,
					title: competition.name,
				});
			}}
			goToClass={(className: string) => () => {
				props.navigation.navigate(Routes.results, {
					className,
					id: props.route.params.id,
				});
			}}
		/>
	);
};
