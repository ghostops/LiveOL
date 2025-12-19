import {
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useOLNavigation } from '~/hooks/useNavigation';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { paths } from '~/lib/react-query/schema';
import { COLORS } from '~/util/const';
import { OLLoading } from '~/views/components/loading';
import { OLText } from '~/views/components/text';
import { OLHomeBadge } from './badge';
import { flagEmoji } from '~/util/flagEmoji';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { OLApiStatus } from '~/views/components/ApiStatus';
import { useEffect, useState } from 'react';
import BootSplash from 'react-native-bootsplash';
import { OLButton } from '~/views/components/button';

export const OLSceneHome = () => {
  const { colors, px } = useTheme();
  const { t } = useTranslation();
  const [showFutureCompetitions, setShowFutureCompetitions] = useState(false);

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const getTodaysCompetitionsQuery = $api.useQuery(
    'get',
    '/v2/competitions/today',
    {
      params: {
        query: {
          timezone,
        },
      },
    },
  );

  const getCompetitionsQuery = $api.useInfiniteQuery(
    'get',
    '/v2/competitions',
    {
      params: {
        query: {
          cursor: 1,
          timezone,
          showFuture: showFutureCompetitions ? '1' : '0',
        },
      },
    },
    {
      getNextPageParam: (
        res: paths['/v2/competitions']['get']['responses']['200']['content']['application/json'],
      ) => {
        if (!res.data.nextPage || res.data.nextPage > res.data.lastPage) {
          return undefined;
        }
        return res.data.nextPage;
      },
      initialPageParam: 1,
    },
  );

  const isRefreshing =
    getTodaysCompetitionsQuery.isRefetching ||
    getCompetitionsQuery.isRefetching;

  const refetch = async () => {
    await Promise.all([
      getTodaysCompetitionsQuery.refetch(),
      getCompetitionsQuery.refetch(),
    ]);
  };

  const hasCompetitionsToday =
    !!getTodaysCompetitionsQuery.data?.data.competitions.length;

  useEffect(() => {
    if (getCompetitionsQuery.isFetched) {
      BootSplash.hide({ fade: true });
    }
  }, [getCompetitionsQuery.isFetched]);

  return (
    <View style={{ flex: 1 }}>
      <OLApiStatus />
      <SectionList
        sections={
          getCompetitionsQuery.data
            ? getCompetitionsQuery.data.pages
                .flatMap(p => p.data.competitions)
                .map(c => ({
                  title: c.competition_date,
                  data: c.competitions,
                }))
            : []
        }
        renderSectionHeader={({ section: { title } }) => {
          return (
            <View style={style.header}>
              <OLText size={12}>{title}</OLText>
            </View>
          );
        }}
        renderItem={({ item }) => {
          return <HomeRowItem item={item} showOrganizationName />;
        }}
        keyExtractor={item => String(item.id)}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refetch}
            tintColor={colors.MAIN}
          />
        }
        ListFooterComponent={
          getCompetitionsQuery.isFetchingNextPage ? (
            <View style={{ padding: px(16) }}>
              <OLLoading />
            </View>
          ) : null
        }
        onEndReached={() => {
          if (getCompetitionsQuery.isFetchingNextPage) {
            return;
          }
          getCompetitionsQuery.fetchNextPage();
        }}
        ListHeaderComponent={
          <View>
            {showFutureCompetitions === false && (
              <View
                style={{
                  alignSelf: 'flex-start',
                  padding: px(4),
                }}
              >
                <OLButton
                  small
                  onPress={() => {
                    setShowFutureCompetitions(true);
                  }}
                >
                  {t('See future competitions')}
                </OLButton>
              </View>
            )}

            <View
              style={{
                backgroundColor: COLORS.MAIN,
                paddingHorizontal: px(8),
                paddingBottom: hasCompetitionsToday ? px(16) : 0,
                paddingTop: px(8),
              }}
            >
              <OLText
                style={{
                  color: COLORS.WHITE,
                  marginBottom: px(8),
                  textAlign: hasCompetitionsToday ? 'left' : 'center',
                }}
                bold
                size={16}
              >
                {hasCompetitionsToday
                  ? t('Today')
                  : t('There are no competitions today')}
              </OLText>
              <View style={{ backgroundColor: COLORS.WHITE }}>
                {getTodaysCompetitionsQuery.data?.data.competitions.map(
                  item => (
                    <HomeRowItem
                      key={item.id}
                      item={item}
                      showOrganizationName
                    />
                  ),
                )}
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};

export const HomeRowItem = ({
  item,
  onPress,
  showDate = false,
  showOrganizationName = false,
}: {
  item: paths['/v2/competitions']['get']['responses']['200']['content']['application/json']['data']['competitions'][number]['competitions'][number];
  onPress?: () => void;
  showDate?: boolean;
  showOrganizationName?: boolean;
}) => {
  const { colors, px } = useTheme();
  const { navigate } = useOLNavigation();
  return (
    <TouchableOpacity
      style={style.item}
      onPress={
        onPress ||
        (() => {
          navigate('Competition', {
            olCompetitionId: item.olCompetitionId,
          });
        })
      }
    >
      <View style={style.row}>
        <View style={{ flex: 1 }}>
          <OLText size={16} numberOfLines={1} style={{ flexShrink: 1 }}>
            {item.name}
          </OLText>
          {showOrganizationName && item.organizer && (
            <OLText
              size={12}
              style={{ opacity: 0.9, marginTop: px(2), fontStyle: 'italic' }}
            >
              {item.organizer}
            </OLText>
          )}
          {showDate && (
            <OLText size={12} style={{ opacity: 0.9, marginTop: px(2) }}>
              {format(new Date(item.date), 'MMMM dd, yyyy')}
            </OLText>
          )}
        </View>
      </View>
      <View style={[style.row, { marginTop: px(2) }]}>
        <View style={{ flex: 1 }}>
          {item.countryCode && flagEmoji[item.countryCode] && (
            <OLText>{flagEmoji[item.countryCode]}</OLText>
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            gap: px(2),
          }}
        >
          {item.hasLiveData && (
            <OLHomeBadge
              text="Live"
              background={colors.RED}
              color={colors.WHITE}
            />
          )}
          {item.hasEventorData && (
            <OLHomeBadge
              text="Eventor"
              background={colors.BLUE}
              color={colors.WHITE}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const style = StyleSheet.create({
  header: {
    padding: 8,
    backgroundColor: COLORS.BACKGROUND,
  },
  item: {
    padding: 8,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
