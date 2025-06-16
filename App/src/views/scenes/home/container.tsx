import { useEffect, useRef } from 'react';
import { useHomeSearchStore } from '~/store/homeSearch';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { OLHome as Component } from './component';
import { OLError } from '~/views/components/error';
import RNBootSplash from 'react-native-bootsplash';
import { format } from 'date-fns';
import { OLFollowSheet } from '~/views/components/follow/followSheet';
import { AppState } from 'react-native';
import { $api } from '~/lib/react-query/api';
import { paths } from '~/lib/react-query/schema';

const getToday = () => format(new Date(), 'yyyy-MM-dd');

export const OLHome: React.FC = () => {
  const { isLandscape } = useDeviceRotationStore();
  const { isSearching, searchTerm, setIsSearching } = useHomeSearchStore();
  const { navigate } = useOLNavigation();
  const hasLoaded = useRef(false);

  const getCompetitionsQuery = $api.useInfiniteQuery(
    'get',
    '/v1/competitions',
    {
      params: {
        query: {
          search: searchTerm || undefined,
          date: getToday(),
          cursor: 1,
        },
      },
    },
    {
      getNextPageParam: (
        res: paths['/v1/competitions']['get']['responses']['200']['content']['application/json'],
      ) => {
        if (res.data.nextPage >= res.data.lastPage) {
          return undefined;
        }
        return res.data.nextPage;
      },
      initialPageParam: 0,
    },
  );

  const getTodaysCompetitionsQuery = $api.useQuery(
    'get',
    '/v1/competitions/today',
    { params: { query: { date: getToday() } } },
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
          getCompetitionsQuery.data?.pages.flatMap(
            page => page.data.competitions,
          ) || []
        }
        loading={getCompetitionsQuery.isLoading}
        loadingMore={getCompetitionsQuery.isFetchingNextPage}
        loadMore={loadMore}
        openSearch={() => setIsSearching(true)}
        searching={isSearching}
        todaysCompetitions={getTodaysCompetitionsQuery.data?.data.today || []}
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
