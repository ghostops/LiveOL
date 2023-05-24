import React from 'react';
import _ from 'lodash';
import { usePlayAudio } from './hooks/usePlayAudio';
import { useHasChanged } from './hooks/useHasChanged';
import { OLResults as Component } from './component';
import { OLError } from 'views/components/error';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useDeviceRotationStore } from 'store/deviceRotation';
import { RootStack } from 'lib/nav/router';
import { useGetResultsQuery } from 'lib/graphql/generated/gql';
import { OlResult } from 'lib/graphql/generated/types';
import { useSortingStore } from 'store/sorting';
import { usePrevious } from 'hooks/usePrevious';

export const OLResults: React.FC = () => {
  const focus = useIsFocused();
  const { isLandscape } = useDeviceRotationStore();
  const { sortingKey, sortingDirection } = useSortingStore();

  const sorting = `${sortingKey}:${sortingDirection}`;

  const {
    params: { className, competitionId, runnerId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();

  const playAudio = usePlayAudio();

  const { data, loading, error, refetch } = useGetResultsQuery({
    variables: { competitionId, className, sorting },
  });
  const previousData = usePrevious(data);

  const results: OlResult[] = _.get(
    data || previousData,
    'results.getResults',
    null,
  );

  const hasAnyChanged = useHasChanged(results);

  React.useEffect(() => {
    if (!hasAnyChanged) {
      return;
    }

    playAudio();
  }, [hasAnyChanged, playAudio]);

  if (error) {
    return <OLError error={error} refetch={refetch} />;
  }

  return (
    <Component
      loading={loading}
      results={results}
      refetch={async () => {
        await refetch({ className, competitionId });
      }}
      landscape={isLandscape}
      className={className}
      competitionId={competitionId}
      focus={focus}
      followedRunnerId={runnerId}
    />
  );
};
