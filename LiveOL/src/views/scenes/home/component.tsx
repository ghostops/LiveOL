import React from 'react';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { HomeList } from 'views/components/home/list';
import { HomeListItem } from 'views/components/home/listItem';
import { LanguagePicker } from 'views/components/lang/picker';
import { OLSearch } from 'views/components/search/container';
import { OLText } from 'views/components/text';
import { px } from 'util/const';
import { TodaysCompetitions } from 'views/components/home/today';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  competitions: Competition[];
  todaysCompetitions: Competition[];
  onCompetitionPress: (competition: Competition) => void;
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
  todaysCompetitions,
  landscape,
  ...passthroughProps
}) => {
  const { t } = useTranslation();

  const renderTodaysCompetitions = React.useCallback(() => {
    if (searching) {
      return null;
    }

    return (
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
    );
  }, [searching, todaysCompetitions, onCompetitionPress]);

  const renderHeader = React.useCallback(() => {
    return (
      <View
        style={{
          flexDirection: 'row',
          height: px(50),
        }}>
        <LanguagePicker />

        <View
          style={{
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: px(10),
            flexDirection: 'row',
          }}>
          <TouchableOpacity
            onPress={openSearch}
            style={{ paddingHorizontal: px(landscape ? 25 : 0) }}>
            <OLText font="Proxima Nova Regular" size={16}>
              {t('home.search')}
            </OLText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [landscape, openSearch, t]);

  return (
    <View
      style={{
        flex: 1,
        width: '100%',
      }}>
      <View style={{ flex: 1 }}>
        {renderHeader()}

        <HomeList
          onCompetitionPress={onCompetitionPress}
          listHeader={renderTodaysCompetitions()}
          {...passthroughProps}
        />
      </View>

      <OLSearch />
    </View>
  );
};
