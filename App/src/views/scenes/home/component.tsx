import { HomeList } from '~/views/components/home/list';
import { View, Animated } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { OLHomePromo } from './promo';
import { TodaysCompetitions } from '~/views/components/home/today';
import { HomeListItem } from '~/views/components/home/listItem';
import { useCallback, useRef } from 'react';
import { OLHomeBar } from './bar';
import { OLLoading } from '~/views/components/loading';
import { paths } from '~/lib/react-query/schema';

interface Props {
  competitions: paths['/v1/competitions']['get']['responses']['200']['content']['application/json']['data']['competitions'];
  todaysCompetitions: paths['/v1/competitions/today']['get']['responses']['200']['content']['application/json']['data']['today'];
  onCompetitionPress: (
    competition: paths['/v1/competitions']['get']['responses']['200']['content']['application/json']['data']['competitions'][0],
  ) => void;
  openSearch: () => void;
  searching: boolean;
  loading: boolean;
  loadMore: () => Promise<any>;
  refetch: () => Promise<void>;
  landscape?: boolean;
  loadingMore: boolean;
}

export const OLHome: React.FC<Props> = ({
  onCompetitionPress,
  openSearch,
  searching,
  landscape,
  todaysCompetitions,
  ...passthroughProps
}) => {
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  const { px } = useTheme();

  const renderTodaysCompetitions = useCallback(() => {
    if (searching) {
      return null;
    }

    return (
      <>
        <OLHomePromo />

        <TodaysCompetitions
          competitions={todaysCompetitions}
          renderListItem={(competition, index, total) => (
            <HomeListItem
              competition={competition}
              index={index}
              key={competition.id}
              onCompetitionPress={onCompetitionPress}
              total={total}
              style={{ paddingHorizontal: px(8) }}
            />
          )}
        />
      </>
    );
  }, [onCompetitionPress, searching, todaysCompetitions, px]);

  return (
    <View style={{ flex: 1 }}>
      <OLHomeBar
        landscape={!!landscape}
        openSearch={openSearch}
        searching={searching}
      />

      <HomeList
        onCompetitionPress={onCompetitionPress}
        listHeader={renderTodaysCompetitions()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
          { useNativeDriver: false },
        )}
        {...passthroughProps}
      />
      {passthroughProps.loading && <OLLoading badge top={32} />}
    </View>
  );
};
