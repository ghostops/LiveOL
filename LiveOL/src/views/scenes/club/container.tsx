import * as React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { RouterProps } from 'lib/nav/routes';
import { Result } from 'lib/graphql/fragments/types/Result';
import { OLClubResults as Component } from './component';
import { OLLoading } from 'views/components/loading';
import { OLError } from 'views/components/error';
import { GET_CLUB_RESULTS } from 'lib/graphql/queries/results';
import _ from 'lodash';
import { GetClubResults, GetClubResultsVariables } from 'lib/graphql/queries/types/GetClubResults';

type OwnProps = RouterProps<{ competitionId: number; clubName: string }>;

type Props = OwnProps;

export const OLClubResults: React.FC<Props> = ({ route }) => {
	const clubName: string = route.params.clubName;
	const competitionId: number = route.params.competitionId;

	const { data, loading, error, refetch } = useQuery<GetClubResults, GetClubResultsVariables>(GET_CLUB_RESULTS, {
		variables: { competitionId, clubName },
	});

	if (error) {
		return <OLError error={error} refetch={refetch} />;
	}

	if (loading) return <OLLoading />;

	const results: Result[] = _.get(data, 'results.getClubResults', null);

	return (
		<Component
			results={results}
			refetch={async () => {
				await refetch({ clubName, competitionId });
			}}
			clubName={clubName}
			competitionId={competitionId}
		/>
	);
};
