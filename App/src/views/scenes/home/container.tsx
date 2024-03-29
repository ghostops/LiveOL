import { useEffect, useRef } from 'react';
import { useHomeSearchStore } from '~/store/homeSearch';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { OLHome as Component } from './component';
import { OLError } from '~/views/components/error';
import RNBootSplash from 'react-native-bootsplash';
import { trpc } from '~/lib/trpc/client';
import { format } from 'date-fns';
import { OLFollowSheet } from '~/views/components/follow/followSheet';
import { AppState } from 'react-native';

const getToday = () => format(new Date(), 'yyyy-MM-dd');

export const OLHome: React.FC = () => {
  const { isLandscape } = useDeviceRotationStore();
  const { isSearching, searchTerm, setIsSearching } = useHomeSearchStore();
  const { navigate } = useOLNavigation();
  const hasLoaded = useRef(false);

  const getCompetitionsQuery = trpc.getCompetitions.useInfiniteQuery(
    {
      search: searchTerm || undefined,
    },
    {
      getNextPageParam: res => {
        if (res.nextPage >= res.lastPage) {
          return undefined;
        }
        return res.nextPage;
      },
      initialCursor: 1,
      retry: 3,
      retryDelay: 1000,
    },
  );

  const getTodaysCompetitionsQuery = trpc.getTodaysCompetitions.useQuery(
    {
      date: getToday(),
    },
    { gcTime: 0, staleTime: 0 },
  );

  useEffect(() => {
    const callback = AppState.addEventListener('change', status => {
      if (status === 'active') {
        getCompetitionsQuery.refetch();
        getTodaysCompetitionsQuery.refetch();
      }
    });

    return () => callback.remove();
  }, [getCompetitionsQuery, getTodaysCompetitionsQuery]);

  if (getCompetitionsQuery.error) {
    return (
      <OLError
        error={getCompetitionsQuery.error}
        refetch={() => getCompetitionsQuery.refetch()}
      />
    );
  }

  const loadMore = async () => {
    if (getCompetitionsQuery.isLoading) {
      return;
    }

    await getCompetitionsQuery.fetchNextPage();
  };

  if (
    (getCompetitionsQuery.data?.pages.length ||
      getCompetitionsQuery.failureCount > 0) &&
    !hasLoaded.current
  ) {
    hasLoaded.current = true;
    setTimeout(() => {
      RNBootSplash.hide({ fade: true });
    }, 500);
  }

  return (
    <>
      <Component
        competitions={
          getCompetitionsQuery.data?.pages.flatMap(page => page.competitions) ||
          []
        }
        loading={getCompetitionsQuery.isLoading}
        loadingMore={getCompetitionsQuery.isFetchingNextPage}
        loadMore={loadMore}
        openSearch={() => setIsSearching(true)}
        searching={isSearching}
        todaysCompetitions={getTodaysCompetitionsQuery.data?.today || []}
        refetch={async () => {
          await Promise.all([
            getCompetitionsQuery.refetch(),
            getTodaysCompetitionsQuery.refetch(),
          ]);
        }}
        onCompetitionPress={competition => {
          navigate('Competition', {
            competitionId: competition.id || -1,
            title: competition.name,
          });
        }}
        landscape={isLandscape}
      />
      <OLFollowSheet />
    </>
  );
};
