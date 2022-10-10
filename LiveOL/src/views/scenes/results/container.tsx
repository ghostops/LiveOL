import * as React from 'react';
import { useQuery } from '@apollo/client';
import { usePlayAudio } from './hooks/usePlayAudio';
import { useHasChanged } from './hooks/useHasChanged';
import { Result } from 'lib/graphql/fragments/types/Result';
import { OLResults as Component } from './component';
import { OLLoading } from 'views/components/loading';
import { OLError } from 'views/components/error';
import {
  GetResults,
  GetResultsVariables,
} from 'lib/graphql/queries/types/GetResults';
import { GET_RESULTS } from 'lib/graphql/queries/results';
import _ from 'lodash';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useDeviceRotationStore } from 'store/deviceRotation';
import { RootStack } from 'lib/nav/router';

export const OLResults: React.FC = () => {
  const focus = useIsFocused();
  const { isLandscape } = useDeviceRotationStore();

  const {
    params: { className, competitionId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();

  const playAudio = usePlayAudio();

  const { data, loading, error, refetch } = useQuery<
    GetResults,
    GetResultsVariables
  >(GET_RESULTS, {
    variables: { competitionId, className },
  });

  const hasAnyChanged = useHasChanged(data?.results?.getResults);

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
      focus={focus}
    />
  );
};
