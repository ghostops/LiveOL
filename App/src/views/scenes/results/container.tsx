import React from 'react';
import _ from 'lodash';
import { usePlayAudio } from './hooks/usePlayAudio';
import { useHasChanged } from './hooks/useHasChanged';
import { OLResults as Component } from './component';
import { OLLoading } from 'views/components/loading';
import { OLError } from 'views/components/error';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useDeviceRotationStore } from 'store/deviceRotation';
import { RootStack } from 'lib/nav/router';
import { useGetResultsQuery } from 'lib/graphql/generated/gql';
import { OlResult } from 'lib/graphql/generated/types';

export const OLResults: React.FC = () => {
  const focus = useIsFocused();
  const { isLandscape } = useDeviceRotationStore();

  const {
    params: { className, competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();

  const playAudio = usePlayAudio();

  const { data, loading, error, refetch } = useGetResultsQuery({
    variables: { competitionId, className },
  });

  const results: OlResult[] = _.get(data, 'results.getResults', null);

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

  if (loading) {
    return <OLLoading />;
  }

  return (
    <Component
      results={results}
      refetch={async () => {
        await refetch({ className, competitionId });
      }}
      landscape={isLandscape}
      className={className}
      competitionId={competitionId}
      focus={focus}
    />
  );
};
