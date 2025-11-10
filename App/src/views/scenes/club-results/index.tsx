import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLText } from '~/views/components/text';
import { OLClubResultRow } from './row';

export const OLSceneClubResults = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'ClubResults'>>();
  const navigation = useOLNavigation();
  const { t } = useTranslation();
  const { liveCompetitionId, olOrganizationId } = params;

  // Fetch filtered results for this organization in this competition
  const getResultsQuery = $api.useQuery(
    'get',
    '/v2/results/live/organizations/{liveCompetitionId}/{olOrganizationId}',
    {
      params: {
        path: { liveCompetitionId, olOrganizationId },
      },
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
      <FlashList
        style={{ flex: 1 }}
        data={getResultsQuery.data?.data.results || []}
        renderItem={({ item }) => <OLClubResultRow resultItem={item} />}
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
                {t('classes.empty')}
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
