import { OLResults as Component } from './component';
import { OLError } from '~/views/components/error';
import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { RootStack } from '~/lib/nav/router';
import { useSortingStore } from '~/store/sorting';
import { trpc } from '~/lib/trpc/client';
import { useEffect, useRef } from 'react';
import { useLiveRunningStore } from '~/store/liveRunning';
import { Vibration } from 'react-native';
import { nowTimestamp } from '~/util/isLive';
import { useSearchRunner } from './useSearchRunner';

function getTickTimestamp(_tick: number) {
  return nowTimestamp();
}

export const OLResults: React.FC = () => {
  const focus = useIsFocused();
  const { isLandscape } = useDeviceRotationStore();
  const { sortingKey, sortingDirection } = useSortingStore();
  const startTicking = useLiveRunningStore(state => state.startTicking);
  const stopTicking = useLiveRunningStore(state => state.stopTicking);
  const tick = useLiveRunningStore(state => state.tick);
  const oldHashes = useRef<string[]>([]);

  const sorting = `${sortingKey}:${sortingDirection}`;

  const {
    params: { className, competitionId, runnerId },
  } = useRoute<RouteProp<RootStack, 'Results'>>();

  const getResultsQuery = trpc.getResults.useQuery(
    {
      className,
      competitionId,
      sorting,
      nowTimestamp: getTickTimestamp(tick),
    },
    {
      staleTime: 0,
      queryKeyHashFn: () => `${competitionId}:${className}:${sorting}`,
    },
  );

  const foundRunner = useSearchRunner(getResultsQuery.data?.results);

  useEffect(() => {
    oldHashes.current = [];
  }, [className, competitionId]);

  useEffect(() => {
    if (getResultsQuery.data?.hash) {
      if (
        oldHashes.current.length &&
        !oldHashes.current.includes(getResultsQuery.data.hash)
      ) {
        Vibration.vibrate();
        __DEV__ && console.log('[vibrated]', getResultsQuery.data?.hash);
      }

      oldHashes.current = [...oldHashes.current, getResultsQuery.data.hash];
    }
  }, [getResultsQuery.data?.hash]);

  useEffect(() => {
    startTicking();

    return () => {
      stopTicking();
    };
  }, [startTicking, stopTicking]);

  if (getResultsQuery.error) {
    return (
      <OLError
        error={getResultsQuery.error}
        refetch={getResultsQuery.refetch}
      />
    );
  }

  const followedRunnerId = !foundRunner ? runnerId : foundRunner?.id;

  return (
    <Component
      loading={getResultsQuery.isLoading}
      results={getResultsQuery.data?.results || []}
      refetch={async () => {
        await getResultsQuery.refetch();
      }}
      isLandscape={isLandscape}
      className={className}
      competitionId={competitionId}
      focus={focus}
      followedRunnerId={followedRunnerId}
    />
  );
};
