import * as React from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { HomeListItem } from './listItem';
import { isDateToday, dateToReadable } from 'util/date';
import { OLListItem } from '../list/item';
import { OLLoading } from '../loading';
import { OLSafeAreaView } from '../safeArea';
import { OLText } from '../text';
import { px } from 'util/const';
import { useTranslation } from 'react-i18next';
import { OlCompetition } from 'lib/graphql/generated/types';

interface Props {
  competitions: OlCompetition[];
  onCompetitionPress: (comp: OlCompetition) => void;
  listHeader: JSX.Element | null;
  loadMore: () => Promise<any>;
  refetch: () => Promise<void>;
  loading: boolean;
}

export const groupVisibleCompetitions = (
  visibleCompetitions: OlCompetition[],
): Record<string, OlCompetition[]> => {
  const uniqEs6 = (arrArg: any[]) =>
    arrArg.filter((elem, pos, arr) => {
      return arr.indexOf(elem) === pos;
    }) as string[];

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
}) => {
  const { t } = useTranslation();
  const [moreLoading, setMoreLoading] = React.useState(false);

  const visibleCompetitions = groupVisibleCompetitions(competitions);

  const renderListItem = (
    competition: OlCompetition,
    index: number,
    total: number,
  ) => (
    <HomeListItem
      key={competition.id}
      competition={competition}
      index={index}
      onCompetitionPress={onCompetitionPress}
      total={total}
    />
  );

  const renderListSection = (
    date: string,
    comps: Record<string, OlCompetition[]>,
  ) => {
    const isToday = isDateToday(date);
    const dateStr = dateToReadable(date);

    return (
      <OLSafeAreaView key={date}>
        <View>
          <OLListItem
            itemDivider
            style={{
              marginLeft: 0,
              paddingHorizontal: px(16),
            }}>
            <OLText size={16} font="Proxima-Nova-Bold regular">
              {dateStr} {isToday && `(${t('home.today')})`}
            </OLText>
          </OLListItem>

          <View style={{ backgroundColor: 'white' }}>
            {comps[date].map((comp, index) =>
              renderListItem(comp, index, comps[date].length),
            )}
          </View>
        </View>
      </OLSafeAreaView>
    );
  };

  if (loading) {
    return <OLLoading />;
  }

  return (
    <FlatList
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refetch}
          tintColor="black"
        />
      }
      ListHeaderComponent={listHeader}
      data={Object.keys(visibleCompetitions)}
      renderItem={({ item }) => renderListSection(item, visibleCompetitions)}
      keyExtractor={item => `${item}`}
      onEndReached={async () => {
        setMoreLoading(true);
        await loadMore();
        setMoreLoading(false);
      }}
      onEndReachedThreshold={0.1}
      ListFooterComponent={moreLoading ? <OLLoading /> : null}
      ListEmptyComponent={
        !loading && (
          <View
            style={{
              width: '100%',
              paddingVertical: px(16 * 4),
            }}>
            <OLText
              font="Proxima Nova Regular"
              size={16}
              style={{
                textAlign: 'center',
              }}>
              {t('home.nothingSearch')}
            </OLText>
          </View>
        )
      }
    />
  );
};
