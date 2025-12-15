import { RouteProp, useRoute } from '@react-navigation/native';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { RootStack } from '~/lib/nav/router';
import { $api } from '~/lib/react-query/api';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useLayoutEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toZonedTime, format } from 'date-fns-tz';
import { CompetitionInfoBox } from '~/views/components/competition/info';
import { OLHomeBadge } from '../home/badge';

export const OLSceneCompetition = () => {
  const { colors } = useTheme();
  const { params } = useRoute<RouteProp<RootStack, 'Competition'>>();
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
  const date = useMemo(() => {
    if (!getCompetitionQuery.data?.data.competition.date) {
      return null;
    }
    const raw = getCompetitionQuery.data.data.competition.date;
    const zoned = toZonedTime(
      new Date(raw),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    return format(zoned, 'PP');
  }, [getCompetitionQuery.data?.data.competition.date]);

  useLayoutEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.BACKGROUND,
      }}
    >
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 128 }}
        refreshControl={
          <RefreshControl
            refreshing={getCompetitionQuery.isRefetching}
            onRefresh={() => getCompetitionQuery.refetch()}
            colors={[colors.MAIN]}
            tintColor={colors.MAIN}
          />
        }
        data={getCompetitionQuery.data?.data.classes || []}
        renderItem={({ item }) => (
          <View
            style={{
              borderTopWidth: 1,
              borderColor: colors.BORDER,
              backgroundColor: colors.WHITE,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('LiveResults', {
                  liveClassId: item.liveClassId,
                  olCompetitionId: params.olCompetitionId,
                });
              }}
              style={{
                padding: 12,
              }}
            >
              <OLText size={16}>{item.name}</OLText>
            </TouchableOpacity>
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
                olOrganizationId={
                  getCompetitionQuery.data?.data.competition.olOrganizationId
                }
                olCompetitionId={
                  getCompetitionQuery.data?.data.competition.olCompetitionId
                }
              />

              {getCompetitionQuery.data?.data.competition.date && (
                <OLText size={16}>
                  {t('Date')}: {date}
                </OLText>
              )}
              {getCompetitionQuery.data?.data.competition.distance && (
                <OLText
                  size={16}
                  style={{
                    textTransform: 'capitalize',
                  }}
                >
                  {t('Distance')}:{' '}
                  {getCompetitionQuery.data.data.competition.distance}
                </OLText>
              )}
              {getCompetitionQuery.data?.data.competition.punchSystem && (
                <OLText size={16}>
                  {t('Punch System')}:{' '}
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

            <OLText size={18} style={{ paddingLeft: 6, marginVertical: 16 }}>
              {t('Classes')}
            </OLText>
          </View>
        }
        ListEmptyComponent={
          getCompetitionQuery.isLoading ? null : (
            <OLText style={{ paddingLeft: 8 }}>
              {t('No classes')}
            </OLText>
          )
        }
      />
    </View>
  );
};

function OrganizerText({
  organizer,
  olOrganizationId,
  olCompetitionId,
}: {
  organizer: string | null | undefined;
  olOrganizationId: string | undefined;
  olCompetitionId: string | undefined;
}) {
  const { t } = useTranslation();
  const navigation = useOLNavigation();

  if (!organizer) {
    return null;
  }

  const Text = (
    <OLText size={16}>
      {t('Organized by')}:{' '}
      <OLText
        size={16}
        style={{ textDecorationLine: olOrganizationId ? 'underline' : 'none' }}
      >
        {organizer}
      </OLText>
    </OLText>
  );

  if (olOrganizationId && olCompetitionId) {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ClubResults', {
            olCompetitionId,
            olOrganizationId,
          });
        }}
      >
        {Text}
      </TouchableOpacity>
    );
  }

  return Text;
}
