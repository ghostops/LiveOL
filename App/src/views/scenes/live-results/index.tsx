import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useLayoutEffect } from 'react';
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

export const OLSceneLiveResults = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'LiveResults'>>();
  const navigation = useOLNavigation();
  const focus = useIsFocused();
  const { t } = useTranslation();
  const startTicking = useLiveRunningStore(state => state.startTicking);
  const stopTicking = useLiveRunningStore(state => state.stopTicking);
  const { liveClassId } = params;

  const getResults = $api.useQuery('get', '/v2/results/live/{liveClassId}', {
    params: { path: { liveClassId } },
  });

  const title = getResults.data?.data.className;

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
            await getResults.refetch();
          }}
        />
      )}
      <OLHorizontalScrollView
        hasRadio={!!getResults.data?.data.liveSplitControls}
      >
        <View style={{ backgroundColor: colors.BACKGROUND }}>
          <OLResultHeader
            liveSplitControls={getResults.data?.data.liveSplitControls}
          />
          <FlashList
            style={{ flex: 1 }}
            data={getResults.data?.data.results || []}
            nestedScrollEnabled
            renderItem={({ item }) => (
              <View
                style={{
                  borderBottomWidth: 1,
                  borderColor: '#ccc',
                }}
              >
                <OLLiveResultRow liveResultItem={item} />
              </View>
            )}
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
