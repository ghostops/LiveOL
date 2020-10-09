import * as React from 'react';
import _ from 'lodash';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { COMPETITIONS } from 'lib/graphql/queries/competitions';
import { Competitions, CompetitionsVariables } from 'lib/graphql/queries/types/Competitions';
import { connect } from 'react-redux';
import { Lang } from 'lib/lang';
import { NavigationProp } from '@react-navigation/native';
import { OLError } from 'views/components/error';
import { OLHome as Component } from './component';
import { Platform } from 'react-native';
import { Routes } from 'lib/nav/routes';
import { useQuery } from '@apollo/react-hooks';
import * as Actions from './store';

interface OwnProps {
	navigation: NavigationProp<any, any>;
}

interface StateProps {
	searchTerm: string;
	searching: boolean;
}

interface DispatchProps {
	setSearching: (value: boolean) => void;
	getCompetition: (id: number) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

const DataWrapper: React.FC<Props> = (props) => {
	const { data, loading, error, fetchMore, refetch } = useQuery<Competitions, CompetitionsVariables>(COMPETITIONS, {
		variables: {
			search: props.searchTerm,
		},
	});

	if (error) {
		return <OLError error={error} refetch={refetch} />;
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
			onCompetitionPress={(competition) => {
				props.navigation.navigate(Routes.competition, {
					id: competition.id,
					title: Platform.OS === 'android' ? competition.name : '',
				});
			}}
		/>
	);
};

const mapStateToProps = (state: AppState): StateProps => ({
	searchTerm: state.home.searchTerm,
	searching: state.home.searching,
});

const mapDispatchToProps = {
	setSearching: Actions.setSearching,
};

export const OLHome = connect(mapStateToProps, mapDispatchToProps)(DataWrapper);
