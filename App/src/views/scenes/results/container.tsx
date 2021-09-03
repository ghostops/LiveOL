import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { useQuery } from '@apollo/react-hooks';
import { usePlayAudio } from './hooks/usePlayAudio';
import { useHasChanged } from './hooks/useHasChanged';
import { showToast } from 'lib/toasts/rotate';
import { RouterProps } from 'lib/nav/routes';
import { Result } from 'lib/graphql/fragments/types/Result';
import { OLResults as Component } from './component';
import { OLLoading } from 'views/components/loading';
import { OLError } from 'views/components/error';
import { isLandscapeSelector } from 'store/isLandscapeSelector';
import { GetResults, GetResultsVariables } from 'lib/graphql/queries/types/GetResults';
import { GET_RESULTS } from 'lib/graphql/queries/results';
import _ from 'lodash';

type OwnProps = RouterProps<{ id: number; className: string }>;

type Props = OwnProps;

export const OLResults: React.FC<Props> = ({ route }) => {
	const isLandscape = useRecoilValue(isLandscapeSelector);

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
			landscape={isLandscape}
			className={className}
			competitionId={competitionId}
		/>
	);
};
