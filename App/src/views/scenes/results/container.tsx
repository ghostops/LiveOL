import * as React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { GET_RESULTS } from 'lib/graphql/queries/results';
import { GetResults, GetResultsVariables } from 'lib/graphql/queries/types/GetResults';
import { OLError } from 'views/components/error';
import { OLLoading } from 'views/components/loading';
import { OLResults as Component } from './component';
import { Result } from 'lib/graphql/fragments/types/Result';
import { RouterProps } from 'lib/nav/routes';
import { showToast } from 'lib/toasts/rotate';
import { useQuery } from '@apollo/react-hooks';
import { useHasChanged } from './hooks/useHasChanged';
import { usePlayAudio } from './hooks/usePlayAudio';

type OwnProps = RouterProps<{ id: number; className: string }>;

interface StateProps {
	landscape: boolean;
}

type Props = OwnProps & StateProps;

const DataWrapper: React.FC<Props> = ({ route, landscape }) => {
	const className: string = route.params.className;
	const competitionId: number = route.params.id;

	React.useEffect(() => {
		void showToast();
	}, []);

	const playAudio = usePlayAudio();

	const { data, loading, error, refetch } = useQuery<GetResults, GetResultsVariables>(GET_RESULTS, {
		variables: { competitionId, className },
	});

	const hasAnyChanged = useHasChanged(data?.results?.getResults);

	React.useEffect(() => {
		if (!hasAnyChanged) return;

		void playAudio();
	}, [hasAnyChanged]);

	if (error) {
		return <OLError error={error} refetch={refetch} />;
	}

	if (loading) return <OLLoading />;

	const results: Result[] = _.get(data, 'results.getResults', null);

	return (
		<Component
			results={results}
			refetch={async () => {
				await refetch({ className, competitionId });
			}}
			landscape={landscape}
			className={className}
			competitionId={competitionId}
		/>
	);
};

const mapStateToProps = (state: AppState): StateProps => ({
	landscape: state.general.rotation === 'landscape',
});

export const OLResults = connect(mapStateToProps, null)(DataWrapper);
