import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useLayoutEffect, useState } from 'react';
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
import { useLiveRunningStore } from '~/store/liveRunning';
import { OLHorizontalScrollView } from './horizontal-scrollview';
import { useSortingStore } from '~/store/sorting';
import { keepPreviousData } from '@tanstack/react-query';
import { nowTimestamp as nowTimestampFs } from '~/util/isLive';
import { useNotifyOnUpdate } from './useNotifyOnUpdate';

export const OLSceneLiveResults = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'LiveResults'>>();
  const navigation = useOLNavigation();
  const focus = useIsFocused();
  const { t } = useTranslation();
  const startTicking = useLiveRunningStore(state => state.startTicking);
  const stopTicking = useLiveRunningStore(state => state.stopTicking);
  const { sortingDirection, sortingKey } = useSortingStore();
  const [nowTimestamp, setNowTimestamp] = useState(nowTimestampFs());
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
        },
      },
    },
    {
      placeholderData: keepPreviousData,
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

  useEffect(() => {
    startTicking();

    return () => {
      stopTicking();
    };
  }, [startTicking, stopTicking]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.BACKGROUND }}>
      {focus && (
        <OLRefetcherBar
          interval={15_000}
          refetch={async () => {
            setNowTimestamp(nowTimestampFs());
          }}
        />
      )}
      <OLHorizontalScrollView hasSplits={hasSplits}>
        <View style={{ backgroundColor: colors.BACKGROUND }}>
          <OLResultHeader
            liveSplitControls={getResults.data?.data.liveSplitControls}
          />
          <FlashList
            style={{ flex: 1 }}
            data={getResults.data?.data.results || []}
            nestedScrollEnabled
            renderItem={({ item }) => <OLLiveResultRow liveResultItem={item} />}
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
                    {t('classes.empty')}
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
