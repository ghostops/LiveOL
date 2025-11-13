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

export const OLSceneHome = () => {
  const { colors, px } = useTheme();
  const { t } = useTranslation();

  const getTodaysCompetitionsQuery = $api.useQuery(
    'get',
    '/v2/competitions/today',
    {
      params: {
        query: {
          now: new Date().toISOString().split('T')[0],
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
        },
      },
    },
    {
      getNextPageParam: (
        res: paths['/v2/competitions']['get']['responses']['200']['content']['application/json'],
      ) => {
        if (!res.data.nextPage || res.data.nextPage >= res.data.lastPage) {
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

  return (
    <View style={{ flex: 1 }}>
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
          return <HomeRowItem item={item} />;
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
          <View
            style={{
              backgroundColor: COLORS.MAIN,
              paddingHorizontal: px(8),
              paddingBottom: px(16),
              paddingTop: px(8),
            }}
          >
            <OLText
              style={{ color: COLORS.WHITE, marginBottom: px(8) }}
              bold
              size={16}
            >
              {t('home.today')}
            </OLText>
            <View style={{ backgroundColor: COLORS.WHITE }}>
              {getTodaysCompetitionsQuery.data?.data.competitions.map(item => (
                <HomeRowItem key={item.id} item={item} />
              ))}
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
}: {
  item: paths['/v2/competitions']['get']['responses']['200']['content']['application/json']['data']['competitions'][number]['competitions'][number];
  onPress?: () => void;
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
