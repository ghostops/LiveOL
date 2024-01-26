import { useRef } from 'react';
import { useSearchStore } from '~/store/search';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useDeviceRotationStore } from '~/store/deviceRotation';
import { Platform } from 'react-native';
import { OLHome as Component } from './component';
import { OLError } from '~/views/components/error';
import RNBootSplash from 'react-native-bootsplash';
import { trpc } from '~/lib/trpc/client';
import { format } from 'date-fns';

const getToday = () => format(new Date(), 'yyyy-MM-dd');

export const OLHome: React.FC = () => {
  const { isLandscape } = useDeviceRotationStore();
  const { isSearching, searchTerm, setIsSearching } = useSearchStore();
  const { navigate } = useOLNavigation();
  const hasLoaded = useRef(false);

  const getCompetitionsQuery = trpc.getCompetitions.useInfiniteQuery(
    {
      search: searchTerm || undefined,
    },
    { getNextPageParam: lastPage => lastPage.nextPage, initialCursor: 1 },
  );

  const getTodaysCompetitionsQuery = trpc.getTodaysCompetitions.useQuery({
    date: getToday(),
  });

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

  if (!!getCompetitionsQuery.data?.pages && !hasLoaded.current) {
    hasLoaded.current = true;
    RNBootSplash.hide({ fade: true });
  }

  return (
    <Component
      competitions={
        getCompetitionsQuery.data?.pages.flatMap(page => page.competitions) ||
        []
      }
      loading={getCompetitionsQuery.isLoading}
      loadMore={loadMore}
      openSearch={() => setIsSearching(true)}
      searching={isSearching}
      todaysCompetitions={getTodaysCompetitionsQuery.data?.today || []}
      refetch={async () => {
        await getCompetitionsQuery.refetch();
      }}
      onCompetitionPress={competition => {
        navigate('Competition', {
          competitionId: competition.id || -1,
          title: Platform.OS === 'android' ? competition.name || '' : '',
        });
      }}
      landscape={isLandscape}
    />
  );
};
