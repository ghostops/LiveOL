import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useLayoutEffect } from 'react';
import { View } from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLRefetcherBar } from '~/views/components/refetcher/bar';
import { OLText } from '~/views/components/text';

export const OLSceneLiveResults = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'LiveResults'>>();
  const navigation = useOLNavigation();
  const focus = useIsFocused();
  const { liveClassId } = params;

  const getResults = $api.useQuery('get', '/v2/results/live/{liveClassId}', {
    params: { path: { liveClassId } },
  });

  const title = getResults.data?.data.className;

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

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
      <FlashList
        style={{ flex: 1 }}
        data={getResults.data?.data.results || []}
        renderItem={({ item }) => (
          <View
            style={{ padding: 16, borderBottomWidth: 1, borderColor: '#ccc' }}
          >
            <OLText style={{ fontWeight: 'bold' }}>{item.name}</OLText>
            <OLText>Organization: {item.organization || 'N/A'}</OLText>
            <OLText>
              Result: {item.result !== null ? item.result : 'N/A'}
            </OLText>
            <OLText>
              Status: {item.status !== null ? item.status : 'N/A'}
            </OLText>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 128 }}
      />
    </View>
  );
};
