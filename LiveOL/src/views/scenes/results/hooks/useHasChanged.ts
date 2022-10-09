import React from 'react';
import { Result } from 'lib/graphql/fragments/types/Result';
import { resultsChanged } from 'util/hasChanged';

export const useHasChanged = (currentResults: Result[]) => {
	const [previousResults, setPreviousResults] = React.useState<Result[]>();
	const [hasChanged, setHasChanged] = React.useState(false);

	React.useEffect(() => {
		setPreviousResults(currentResults);

		if (!currentResults || !previousResults) return;

		const anyChanges = currentResults.some((current) => {
			const previous = previousResults.find((result) => result.id === current.id);
			if (!previous) return false;
			return resultsChanged(previous, current);
		});

		setHasChanged(anyChanges);
	}, [currentResults, previousResults]);

	return hasChanged;
};
