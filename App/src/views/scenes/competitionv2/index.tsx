import { RouteProp, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const OLSceneCompetitionV2 = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'CompetitionV2'>>();
  const navigation = useOLNavigation();
  const { t } = useTranslation();

  const getCompetitionQuery = $api.useQuery('get', '/v2/competitions/{id}', {
    params: {
      path: {
        id: params.olCompetitionId,
      },
    },
  });

  const title = getCompetitionQuery.data?.data.competition.name;

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.WHITE,
      }}
    >
      <View style={{ padding: 8 }}>
        {getCompetitionQuery.data?.data.competition.organizer && (
          <OLText size={16}>
            {t('competitions.organizedBy')}:{' '}
            {getCompetitionQuery.data.data.competition.organizer}
          </OLText>
        )}
      </View>
      {getCompetitionQuery.data?.data.competition && (
        <>
          <OLText>
            OL Organization ID:{' '}
            {getCompetitionQuery.data.data.competition.olOrganizationId}
          </OLText>
          <OLText>
            Name: {getCompetitionQuery.data.data.competition.name}
          </OLText>
          <OLText>
            Date: {getCompetitionQuery.data.data.competition.date}
          </OLText>
          <OLText>
            Eventor ID:{' '}
            {getCompetitionQuery.data.data.competition.eventorId || 'N/A'}
          </OLText>
          <OLText>
            Distance:{' '}
            {getCompetitionQuery.data.data.competition.distance || 'N/A'}
          </OLText>
          <OLText>
            Punch System:{' '}
            {getCompetitionQuery.data.data.competition.punchSystem || 'N/A'}
          </OLText>
          <OLText>
            Notification:{' '}
            {getCompetitionQuery.data.data.competition.notification || 'N/A'}
          </OLText>
          <OLText>
            Country Code:{' '}
            {getCompetitionQuery.data.data.competition.countryCode || 'N/A'}
          </OLText>
          <OLText>
            Has Live Data:{' '}
            {getCompetitionQuery.data.data.competition.hasLiveData
              ? 'Yes'
              : 'No'}
          </OLText>
          <OLText>
            Has Eventor Data:{' '}
            {getCompetitionQuery.data.data.competition.hasEventorData
              ? 'Yes'
              : 'No'}
          </OLText>
          <OLText>Links:</OLText>
          {getCompetitionQuery.data.data.competition.links.map(
            (link, index) => (
              <OLText key={index}>
                {link.text}: {link.href}
              </OLText>
            ),
          )}
        </>
      )}

      {/* Add a map view based on lat/lng of competition */}
    </View>
  );
};
