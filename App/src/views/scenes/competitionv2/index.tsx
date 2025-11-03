import { RouteProp, useRoute } from '@react-navigation/native';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CompetitionInfoBox } from '~/views/components/competition/info';
import { OLHomeBadge } from '../homev2/badge';

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
      <FlatList
        style={{ flex: 1 }}
        data={getCompetitionQuery.data?.data.classes || []}
        renderItem={({ item }) => (
          <View>
            <OLText>{item.name}</OLText>
          </View>
        )}
        keyExtractor={item => item.liveClassId}
        ListHeaderComponent={
          <View>
            <View
              style={{
                paddingHorizontal: 8,
                paddingTop: 8,
                gap: 4,
                flexDirection: 'row',
              }}
            >
              {getCompetitionQuery.data?.data.competition.hasLiveData && (
                <OLHomeBadge
                  text="Live"
                  background={colors.RED}
                  color={colors.WHITE}
                  expanded
                />
              )}
              {getCompetitionQuery.data?.data.competition.hasEventorData && (
                <OLHomeBadge
                  text="Eventor"
                  background={colors.BLUE}
                  color={colors.WHITE}
                  expanded
                />
              )}
            </View>
            <View style={{ padding: 8, gap: 8 }}>
              <OrganizerText
                organizer={getCompetitionQuery.data?.data.competition.organizer}
                organizerId={
                  getCompetitionQuery.data?.data.competition.olOrganizationId
                }
              />

              {getCompetitionQuery.data?.data.competition.date && (
                <OLText size={16}>
                  {t('competitions.date')}:{' '}
                  {format(
                    new Date(getCompetitionQuery.data.data.competition.date),
                    'PP',
                  )}
                  {/* add locale detection to date-fns */}
                </OLText>
              )}
              {getCompetitionQuery.data?.data.competition.distance && (
                <OLText
                  size={16}
                  style={{
                    textTransform: 'capitalize',
                  }}
                >
                  {t('competitions.distance')}:{' '}
                  {getCompetitionQuery.data.data.competition.distance}
                </OLText>
              )}
              {getCompetitionQuery.data?.data.competition.punchSystem && (
                <OLText size={16}>
                  {t('competitions.punchSystem')}:{' '}
                  {getCompetitionQuery.data.data.competition.punchSystem}
                </OLText>
              )}

              {getCompetitionQuery.data?.data.competition.notification && (
                <CompetitionInfoBox
                  infoHtml={
                    getCompetitionQuery.data.data.competition.notification
                  }
                  links={getCompetitionQuery.data.data.competition.links}
                />
              )}
            </View>

            {/* Add a map view based on lat/lng of competition */}
          </View>
        }
      />
    </View>
  );
};

function OrganizerText({
  organizer,
  organizerId,
}: {
  organizer: string | null | undefined;
  organizerId: string | undefined;
}) {
  const { t } = useTranslation();

  if (!organizer) {
    return null;
  }

  const Text = (
    <OLText size={16}>
      {t('competitions.organizedBy')}:{' '}
      <OLText
        size={16}
        style={{ textDecorationLine: organizerId ? 'underline' : 'none' }}
      >
        {organizer}
      </OLText>
    </OLText>
  );

  if (organizerId) {
    return <TouchableOpacity onPress={() => {}}>{Text}</TouchableOpacity>;
  }

  return Text;
}
