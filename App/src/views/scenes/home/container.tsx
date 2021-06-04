import * as React from 'react';
import moment from 'moment';
import * as Actions from './store';
import { useQuery } from '@apollo/react-hooks';
import { Routes } from 'lib/nav/routes';
import { Platform } from 'react-native';
import { OLHome as Component } from './component';
import { OLError } from 'views/components/error';
import { NavigationProp } from '@react-navigation/native';
import { connect } from 'react-redux';
import { Competitions, CompetitionsVariables } from 'lib/graphql/queries/types/Competitions';
import { COMPETITIONS } from 'lib/graphql/queries/competitions';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import _ from 'lodash';

interface OwnProps {
	navigation: NavigationProp<any, any>;
}

interface StateProps {
	searchTerm: string;
	searching: boolean;
	landscape: boolean;
}

interface DispatchProps {
	setSearching: (value: boolean) => void;
	getCompetition: (id: number) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

const getToday = () => moment().format('YYYY-MM-DD');

const DataWrapper: React.FC<Props> = (props) => {
	const { data, loading, error, fetchMore, refetch } = useQuery<Competitions, CompetitionsVariables>(COMPETITIONS, {
		variables: {
			search: props.searchTerm,
			date: getToday(),
		},
	});

	if (error) {
		return <OLError error={error} refetch={() => refetch({ date: getToday() })} />;
	}

	const competitions: Competition[] = _.get(data, 'competitions.getCompetitions.competitions', []);

	const today: Competition[] = _.get(data, 'competitions.getCompetitions.today', []);

	const loadMore = async () => {
		if (loading) return;

		const page = data.competitions.getCompetitions.page + 1;
		const lastPage = data.competitions.getCompetitions.lastPage;

		if (page >= lastPage) return;

		await fetchMore({
			variables: {
				page,
			},
			updateQuery: (prev: Competitions, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev;

				const competitions = _.uniqBy(
					[
						...prev.competitions.getCompetitions.competitions,
						...fetchMoreResult.competitions.getCompetitions.competitions,
					],
					'id',
				);

				return Object.assign({}, prev, {
					...fetchMoreResult.competitions,
					competitions: {
						...fetchMoreResult.competitions,
						getCompetitions: {
							...fetchMoreResult.competitions.getCompetitions,
							competitions,
						},
					},
				} as Competitions);
			},
		});
	};

	return (
		<Component
			competitions={competitions}
			loading={loading}
			loadMore={loadMore}
			openSearch={() => props.setSearching(true)}
			searching={props.searching}
			todaysCompetitions={today}
			refetch={() => void refetch({ date: getToday() })}
			onCompetitionPress={(competition) => {
				props.navigation.navigate(Routes.competition, {
					id: competition.id,
					title: Platform.OS === 'android' ? competition.name : '',
				});
			}}
			landscape={props.landscape}
		/>
	);
};

const mapStateToProps = (state: AppState): StateProps => ({
	searchTerm: state.home.searchTerm,
	searching: state.home.searching,
	landscape: state.general.rotation === 'landscape',
});

const mapDispatchToProps = {
	setSearching: Actions.setSearching,
};

export const OLHome = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
