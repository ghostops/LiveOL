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

export const OLSceneHome = () => {
  const { colors, px } = useTheme();
  const { navigate } = useOLNavigation();

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
              <OLText size={16}>{title}</OLText>
            </View>
          );
        }}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={style.item}
              onPress={() => {
                navigate('CompetitionV2', {
                  olCompetitionId: item.olCompetitionId,
                });
              }}
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
        }}
        keyExtractor={item => String(item.id)}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={getCompetitionsQuery.isLoading}
            onRefresh={getCompetitionsQuery.refetch}
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
          getCompetitionsQuery.fetchNextPage();
        }}
      />
    </View>
  );
};

const style = StyleSheet.create({
  header: {
    padding: 8,
    backgroundColor: COLORS.BORDER,
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
