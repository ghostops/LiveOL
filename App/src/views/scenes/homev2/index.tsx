import {
  RefreshControl,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { $api } from '~/lib/react-query/api';
import { paths } from '~/lib/react-query/schema';
import { COLORS } from '~/util/const';
import { OLText } from '~/views/components/text';

export const OLSceneHome = () => {
  const { colors } = useTheme();

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
        if (res.data.nextPage >= res.data.lastPage) {
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
            <TouchableOpacity style={style.item}>
              <OLText>{item.id}</OLText>
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
        // ListFooterComponent={
        //   getCompetitionsQuery.isFetchingNextPage ? (
        //     <View style={{ padding: px(16) }}>
        //       <OLLoading />
        //     </View>
        //   ) : null
        // }
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
});
