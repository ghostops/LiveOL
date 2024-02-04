import { useHasChanged } from './hooks/useHasChanged';
import { OLResults as Component } from './component';
import { OLError } from '~/views/components/error';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { RootStack } from '~/lib/nav/router';
import { useSortingStore } from '~/store/sorting';
import { usePrevious } from '~/hooks/usePrevious';
import { trpc } from '~/lib/trpc/client';
import { useEffect } from 'react';
import { Vibration } from 'react-native';

export const OLResults: React.FC = () => {
  const focus = useIsFocused();
  const { isLandscape } = useDeviceRotationStore();
  const { sortingKey, sortingDirection } = useSortingStore();

  const sorting = `${sortingKey}:${sortingDirection}`;

  const {
    params: { className, competitionId, runnerId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();

  const getResultsQuery = trpc.getResults.useQuery({
    className,
    competitionId,
    sorting,
  });

  const previousData = usePrevious(getResultsQuery.data);

  const results = getResultsQuery.data || previousData;

  const hasAnyChanged = useHasChanged(results);

  useEffect(() => {
    if (!hasAnyChanged) {
      return;
    }

    Vibration.vibrate();
  }, [hasAnyChanged]);

  if (getResultsQuery.error) {
    return (
      <OLError
        error={getResultsQuery.error}
        refetch={getResultsQuery.refetch}
      />
    );
  }

  return (
    <Component
      loading={getResultsQuery.isLoading}
      results={getResultsQuery.data || []}
      refetch={async () => {
        await getResultsQuery.refetch();
      }}
      isLandscape={isLandscape}
      className={className}
      competitionId={competitionId}
      focus={focus}
      followedRunnerId={runnerId}
    />
  );
};
