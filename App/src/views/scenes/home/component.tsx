import React from 'react';
import { HomeList } from 'views/components/home/list';
import { HomeListItem } from 'views/components/home/listItem';
import { LanguagePicker } from 'views/components/lang/picker';
import { OLSearch } from 'views/components/search/container';
import { OLText } from 'views/components/text';
import { TodaysCompetitions } from 'views/components/home/today';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { OlCompetition } from 'lib/graphql/generated/types';
import { useOLNavigation } from 'hooks/useNavigation';
import { OLButton } from 'views/components/button';
import { useTheme } from 'hooks/useTheme';
import { usePromoStore } from 'store/promo';

interface Props {
  competitions: OlCompetition[];
  todaysCompetitions: OlCompetition[];
  onCompetitionPress: (competition: OlCompetition) => void;
  openSearch: () => void;
  searching: boolean;
  loading: boolean;
  loadMore: () => Promise<any>;
  refetch: () => Promise<void>;
  landscape?: boolean;
}

const OLHomePromo: React.FC = () => {
  const { px, colors } = useTheme();
  const { navigate } = useOLNavigation();
  const { displayPromo, setDisplayPromo } = usePromoStore();

  if (!displayPromo) {
    return (
      <TouchableOpacity
        style={{ backgroundColor: colors.DARK, paddingVertical: px(8) }}
        onPress={() => navigate('Promo')}
      >
        <OLText
          bold
          uppercase
          size={16}
          style={{ color: 'white', textAlign: 'center' }}
        >
          LiveOL+
        </OLText>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={{
        backgroundColor: 'white',
        padding: px(16),
        borderWidth: 4,
        borderColor: colors.MAIN,
        borderRadius: 8,
        margin: px(8),
      }}
    >
      <OLText
        bold
        italics
        size={22}
        style={{ textAlign: 'center', marginBottom: px(8) }}
      >
        LiveOL+
      </OLText>

      <OLText size={16} style={{ textAlign: 'center', marginBottom: px(16) }}>
        Get the most out of LiveOL and support its continued development. Check
        out LiveOL+ today:
      </OLText>

      <OLButton small onPress={() => navigate('Promo')}>
        Check it out
      </OLButton>

      <TouchableOpacity
        style={{ marginTop: px(16) }}
        onPress={() => {
          setDisplayPromo(false);
        }}
      >
        <OLText size={14} style={{ textAlign: 'center' }}>
          Close
        </OLText>
      </TouchableOpacity>
    </View>
  );
};

export const OLHome: React.FC<Props> = ({
  onCompetitionPress,
  openSearch,
  searching,
  todaysCompetitions,
  landscape,
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
  }, [searching, todaysCompetitions, onCompetitionPress]);

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
