import React from 'react';
import { resultsChanged } from 'util/hasChanged';
import { OlResult } from 'lib/graphql/generated/types';

export const useHasChanged = (currentResults: OlResult[]) => {
  const [previousResults, setPreviousResults] = React.useState<OlResult[]>();
  const [hasChanged, setHasChanged] = React.useState(false);

  React.useEffect(() => {
    setPreviousResults(currentResults);

    if (!currentResults || !previousResults) {
      return;
    }

    const anyChanges = currentResults.some(current => {
      const previous = previousResults.find(result => result.id === current.id);
      if (!previous) {
        return false;
      }
      return resultsChanged(previous, current);
    });

    setHasChanged(anyChanges);
  }, [currentResults, previousResults]);

  return hasChanged;
};
