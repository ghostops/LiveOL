import React from 'react';
import { HomeList } from '~/views/components/home/list';
import { LanguagePicker } from '~/views/components/lang/picker';
import { OLSearch } from '~/views/components/search/container';
import { OLText } from '~/views/components/text';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '~/hooks/useTheme';
import { OLHomePromo } from './promo';
import { FollowWidget } from '~/views/components/follow/followWidget';
import { TRPCQueryOutput } from '~/lib/trpc/client';
import { TodaysCompetitions } from '~/views/components/home/today';
import { HomeListItem } from '~/views/components/home/listItem';

interface Props {
  competitions: TRPCQueryOutput['getCompetitions']['competitions'];
  todaysCompetitions: TRPCQueryOutput['getTodaysCompetitions']['today'];
  onCompetitionPress: (
    competition: TRPCQueryOutput['getCompetitions']['competitions'][0],
  ) => void;
  openSearch: () => void;
  searching: boolean;
  loading: boolean;
  loadMore: () => Promise<any>;
  refetch: () => Promise<void>;
  landscape?: boolean;
}

export const OLHome: React.FC<Props> = ({
  onCompetitionPress,
  openSearch,
  searching,
  landscape,
  todaysCompetitions,
  ...passthroughProps
}) => {
  const { px } = useTheme();
  const { t } = useTranslation();

  const renderTodaysCompetitions = React.useCallback(() => {
    if (searching) {
      return null;
    }

    return (
      <>
        <FollowWidget />

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
            />
          )}
        />
      </>
    );
  }, [onCompetitionPress, searching, todaysCompetitions]);

  const renderHeader = React.useCallback(() => {
    if (searching) {
      return <OLSearch />;
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          height: px(50),
        }}
      >
        <LanguagePicker />

        <View
          style={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: px(10),
            flexDirection: 'row',
          }}
        >
          <TouchableOpacity
            onPress={openSearch}
            style={{ paddingHorizontal: px(landscape ? 25 : 0) }}
          >
            <OLText size={16}>{t('home.search')}</OLText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [landscape, openSearch, px, searching, t]);

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
      }}
    >
      <View style={{ flex: 1 }}>
        {renderHeader()}

        <HomeList
          onCompetitionPress={onCompetitionPress}
          listHeader={renderTodaysCompetitions()}
          {...passthroughProps}
        />
      </View>
    </View>
  );
};
