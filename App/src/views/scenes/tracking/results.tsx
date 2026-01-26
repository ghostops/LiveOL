import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { FlatList, View } from 'react-native';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLTrackingResultRow } from './row';
import { OLResultHeader } from '../live-results/result-header';
import { OLRefetcherBar } from '~/views/components/refetcher/bar';
import { keepPreviousData } from '@tanstack/react-query';
import { useLayoutEffect, useState } from 'react';
import { nowTimestamp as nowTimestampFs } from '~/util/time';
import { useSortingStore } from '~/store/sorting';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useUserIdStore } from '~/store/userId';
import { useRefreshIntervalStore } from '~/store/refreshInterval';
import { useTicker } from '~/hooks/useTicker';
import { px } from '~/util/const';

export const OLSceneTrackingResults = () => {
  const {
    params: { trackingId, title },
  } = useRoute<RouteProp<RootStack, 'TrackingResults'>>();
  const [nowTimestamp, setNowTimestamp] = useState(nowTimestampFs());
  const focus = useIsFocused();
  const { sortingDirection, sortingKey } = useSortingStore();
  const navigation = useOLNavigation();
  const uid = useUserIdStore(state => state.userId);
  const refreshIntervalMs = useRefreshIntervalStore(
    state => state.refreshIntervalMs,
  );
  // Ticks for live results
  useTicker();

  useLayoutEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [navigation, title]);

  const { data } = $api.useQuery(
    'get',
    '/v2/results/live/tracked/{trackingId}',
    {
      params: {
        path: { trackingId },
        query: { sortingKey, sortingDirection, nowTimestamp, uid },
      },
    },
    {
      placeholderData: keepPreviousData,
      enabled: focus,
    },
  );

  return (
    <View style={{ flex: 1 }}>
      <OLRefetcherBar
        interval={refreshIntervalMs}
        refetch={async () => {
          setNowTimestamp(nowTimestampFs());
        }}
        enabled={focus}
      />
      <OLResultHeader />
      <FlatList
        data={data?.data.results}
        keyExtractor={item => item.liveResultId}
        renderItem={({ item }) => <OLTrackingResultRow result={item} />}
        contentContainerStyle={{ paddingBottom: px(128) }}
      />
    </View>
  );
};
