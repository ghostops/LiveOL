import { RouteProp, useIsFocused, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useLayoutEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLText } from '~/views/components/text';
import { OLClubResultRow } from './row';
import { OLResultHeader } from '../live-results/result-header';
import { useSortingStore } from '~/store/sorting';
import { nowTimestamp as nowTimestampFs } from '~/util/isLive';
import { OLRefetcherBar } from '~/views/components/refetcher/bar';
import { keepPreviousData } from '@tanstack/react-query';
import { useUserIdStore } from '~/store/userId';

export const OLSceneClubResults = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'ClubResults'>>();
  const navigation = useOLNavigation();
  const { t } = useTranslation();
  const { olCompetitionId, olOrganizationId } = params;
  const focus = useIsFocused();
  const { sortingDirection, sortingKey } = useSortingStore();
  const [nowTimestamp, setNowTimestamp] = useState(nowTimestampFs());
  const uid = useUserIdStore(state => state.userId);

  // Fetch filtered results for this organization in this competition
  const getResultsQuery = $api.useQuery(
    'get',
    '/v2/results/live/organizations/{olCompetitionId}/{olOrganizationId}',
    {
      params: {
        path: {
          olCompetitionId,
          olOrganizationId,
        },
        query: {
          sortingKey,
          sortingDirection,
          nowTimestamp,
          uid,
        },
      },
    },
    {
      placeholderData: keepPreviousData,
    },
  );

  const organizationName =
    getResultsQuery.data?.data.results.find(r => r.organization)
      ?.organization || 'N/A';

  useLayoutEffect(() => {
    if (organizationName) {
      navigation.setOptions({ title: organizationName });
    }
  }, [navigation, organizationName]);

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
      <OLResultHeader />
      <FlashList
        style={{ flex: 1 }}
        data={getResultsQuery.data?.data.results || []}
        renderItem={({ item }) => (
          <OLClubResultRow
            resultItem={item}
            olCompetitionId={params.olCompetitionId}
          />
        )}
        ItemSeparatorComponent={Separator}
        contentContainerStyle={{ paddingBottom: 128 }}
        ListEmptyComponent={
          !getResultsQuery.isLoading ? (
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
                {t('classes.emptyClub')}
              </OLText>
            </View>
          ) : null
        }
      />
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
