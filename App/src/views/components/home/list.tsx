import { RefreshControl, SectionList, View } from 'react-native';
import { HomeListItem } from './listItem';
import { isDateToday, dateToReadable } from '~/util/date';
import { OLListItem } from '../list/item';
import { OLLoading } from '../loading';
import { OLText } from '../text';
import { useTranslation } from 'react-i18next';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '~/hooks/useTheme';
import { OLSafeAreaView } from '../safeArea';
import { useHomeSearchStore } from '~/store/homeSearch';

interface Props {
  competitions: TRPCQueryOutput['getCompetitions']['competitions'];
  onCompetitionPress: (
    comp: TRPCQueryOutput['getCompetitions']['competitions'][0],
  ) => void;
  listHeader: JSX.Element | null;
  loadMore: () => Promise<any>;
  refetch: () => Promise<void>;
  loading: boolean;
  loadingMore: boolean;
  onScroll: (event: any) => void;
}

const uniqEs6 = (arrArg: any[]) =>
  arrArg.filter((elem, pos, arr) => {
    return arr.indexOf(elem) === pos;
  }) as string[];

export const groupVisibleCompetitions = (
  visibleCompetitions: TRPCQueryOutput['getCompetitions']['competitions'],
): Record<string, TRPCQueryOutput['getCompetitions']['competitions']> => {
  const keys = uniqEs6(visibleCompetitions.map(comp => comp.date));
  const map: any = {};

  for (const key of keys) {
    map[key] = [];
  }

  for (const comp of visibleCompetitions) {
    if (comp.date) {
      map[comp.date].push(comp);
    }
  }

  return map;
};

export const HomeList: React.FC<Props> = ({
  competitions,
  onCompetitionPress,
  listHeader,
  loadMore,
  loading,
  refetch,
  loadingMore,
  onScroll,
}) => {
  const { t } = useTranslation();
  const { bottom } = useSafeAreaInsets();
  const { px, colors } = useTheme();
  const setRef = useHomeSearchStore(state => state.setSectionListRef);
  const visibleCompetitions = groupVisibleCompetitions(competitions);

  const renderListItem = (
    competition: TRPCQueryOutput['getCompetitions']['competitions'][0],
    index: number,
    total: number,
  ) => (
    <OLSafeAreaView>
      <HomeListItem
        key={competition.id}
        competition={competition}
        index={index}
        onCompetitionPress={onCompetitionPress}
        total={total}
      />
    </OLSafeAreaView>
  );

  return (
    <SectionList
      ref={setRef}
      scrollEventThrottle={16}
      onScroll={onScroll}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          tintColor={colors.MAIN}
        />
      }
      sections={Object.keys(visibleCompetitions).map(key => {
        const value = visibleCompetitions[key];
        return {
          date: key,
          data: value,
        };
      })}
      renderItem={({ item, index, section }) =>
        renderListItem(item, index, section.data.length)
      }
      renderSectionHeader={({ section: { date } }) => {
        const isToday = isDateToday(date);
        const dateStr = dateToReadable(date);

        return (
          <OLSafeAreaView>
            <OLListItem
              itemDivider
              style={{
                marginLeft: 0,
                paddingHorizontal: px(16),
                backgroundColor: isToday ? colors.MAIN : colors.BORDER,
              }}
            >
              <OLText
                size={16}
                style={{ color: isToday ? 'white' : '#141823' }}
              >
                {dateStr} {isToday && `(${t('home.today')})`}
              </OLText>
            </OLListItem>
          </OLSafeAreaView>
        );
      }}
      contentContainerStyle={{ paddingBottom: bottom }}
      ListHeaderComponent={listHeader}
      keyExtractor={item => item.id.toString()}
      ListEmptyComponent={
        !loading ? (
          <View
            style={{
              width: '100%',
              paddingVertical: px(16 * 4),
            }}
          >
            <OLText
              size={16}
              style={{
                textAlign: 'center',
              }}
            >
              {t('home.nothingSearch')}
            </OLText>
          </View>
        ) : null
      }
      ListFooterComponent={
        loadingMore ? (
          <View style={{ padding: px(16) }}>
            <OLLoading />
          </View>
        ) : null
      }
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      stickySectionHeadersEnabled={false}
    />
  );
};
