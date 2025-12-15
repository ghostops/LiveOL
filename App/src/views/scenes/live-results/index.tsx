import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLRefetcherBar } from '~/views/components/refetcher/bar';
import { OLText } from '~/views/components/text';
import { OLResultHeader } from './result-header';
import { OLLiveResultRow } from './row';
import { OLHorizontalScrollView } from './horizontal-scrollview';
import { useSortingStore } from '~/store/sorting';
import { keepPreviousData } from '@tanstack/react-query';
import { nowTimestamp as nowTimestampFs } from '~/util/isLive';
import { useNotifyOnUpdate } from './useNotifyOnUpdate';
import { useUserIdStore } from '~/store/userId';
import { useRefreshIntervalStore } from '~/store/refreshInterval';
import { useTicker } from '~/hooks/useTicker';

export const OLSceneLiveResults = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'LiveResults'>>();
  const navigation = useOLNavigation();
  const focus = useIsFocused();
  const { t } = useTranslation();
  const { sortingDirection, sortingKey } = useSortingStore();
  const [nowTimestamp, setNowTimestamp] = useState(nowTimestampFs());
  const uid = useUserIdStore(state => state.userId);
  const refreshIntervalMs = useRefreshIntervalStore(
    state => state.refreshIntervalMs,
  );
  // Ticks for live results
  useTicker();

  const { liveClassId } = params;

  const getResults = $api.useQuery(
    'get',
    '/v2/results/live/{liveClassId}',
    {
      params: {
        path: { liveClassId },
        query: {
          sortingDirection,
          sortingKey,
          nowTimestamp,
          uid,
        },
      },
    },
    {
      placeholderData: keepPreviousData,
      enabled: focus,
    },
  );

  useNotifyOnUpdate(getResults.data?.data.hash);

  const title = getResults.data?.data.className;
  const hasSplits = !!getResults.data?.data.liveSplitControls?.length;

  useLayoutEffect(() => {
    if (title) {
      navigation.setOptions({ title });
    }
  }, [navigation, title]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      <OLRefetcherBar
        interval={refreshIntervalMs}
        refetch={async () => {
          setNowTimestamp(nowTimestampFs());
        }}
        enabled={focus}
      />
      <OLHorizontalScrollView hasSplits={hasSplits}>
        <View style={{ backgroundColor: colors.BACKGROUND }}>
          <OLResultHeader
            liveSplitControls={getResults.data?.data.liveSplitControls}
          />
          <FlashList
            style={{ flex: 1 }}
            data={getResults.data?.data.results || []}
            nestedScrollEnabled
            renderItem={({ item }) => (
              <OLLiveResultRow
                liveResultItem={item}
                olCompetitionId={params.olCompetitionId}
              />
            )}
            ItemSeparatorComponent={Separator}
            contentContainerStyle={{ paddingBottom: 128 }}
            ListEmptyComponent={
              !getResults.isLoading ? (
                <View
                  style={{
                    paddingVertical: 50,
                  }}
                >
                  <OLText
                    size={18}
                    style={{
                      textAlign: 'center',
                    }}
                  >
                    {t('No competitors in this class')}
                  </OLText>
                </View>
              ) : null
            }
          />
        </View>
      </OLHorizontalScrollView>
    </View>
  );
};

function Separator() {
  const { colors } = useTheme();
  return (
    <View
      style={{ height: 1, backgroundColor: colors.BORDER, width: '100%' }}
    />
  );
}
