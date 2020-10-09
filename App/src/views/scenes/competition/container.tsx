import * as React from 'react';
import { connect } from 'react-redux';
import { NavigationProp, RouteProp } from '@react-navigation/native';
import { NavigationRoute } from 'react-navigation';
import { OLCompetition as Component } from './component';
import { Routes, RouterProps } from 'lib/nav/routes';
import { Lang } from 'lib/lang';
import { useQuery } from '@apollo/react-hooks';
import { GetCompetition, GetCompetitionVariables } from 'lib/graphql/queries/types/GetCompetition';
import { GET_COMPETITION } from 'lib/graphql/queries/competitions';
import { OLError } from 'views/components/error';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { Class } from 'lib/graphql/fragments/types/Class';
import * as _ from 'lodash';
import { OLLoading } from 'views/components/loading';

type OwnProps = RouterProps<{ id, title }>

type Props = OwnProps;

const DataWrapper: React.FC<Props> = (props) => {
	const competitionId: number = props.route.params.id;

	const { data, loading, error, refetch } =
        useQuery<GetCompetition, GetCompetitionVariables>(
        	GET_COMPETITION,
        	{ variables: { competitionId } },
	});

	if (error) {
		return (
			<OLError
				error={error}
				refetch={refetch}
			/>
		);
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

export const OLCompetition = connect(null, null)(DataWrapper);
