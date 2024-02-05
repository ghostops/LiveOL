import { resultsChanged } from '~/util/hasChanged';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { useEffect, useState } from 'react';

export const useHasChanged = (
  currentResults?: TRPCQueryOutput['getResults'],
) => {
  const [previousResults, setPreviousResults] =
    useState<TRPCQueryOutput['getResults']>();
  const [hasChanged, setHasChanged] = useState(false);

  useEffect(() => {
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
