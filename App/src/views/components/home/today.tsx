import React from 'react';
import { dateToReadable } from 'util/date';
import { OLCard } from '../card';
import { OLSafeAreaView } from '../safeArea';
import { OLText } from '../text';
import { View } from 'react-native';
import { useTheme } from 'hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { OlCompetition } from 'lib/graphql/generated/types';

type Props = {
  competitions: OlCompetition[];
  renderListItem: (
    comp: OlCompetition,
    index?: number,
    total?: number,
  ) => React.ReactElement;
};

export const TodaysCompetitions: React.FC<Props> = ({
  competitions,
  renderListItem,
}) => {
  const { px, colors } = useTheme();
  const { t } = useTranslation();

  const nothingToday = !competitions || competitions.length === 0;

  const innerCompetitions = () => (
    <React.Fragment>
      <OLText
        font="Rift Bold"
        size={18}
        style={{
          textAlign: 'center',
          color: 'white',
        }}>
        {t('home.today')}
      </OLText>

      <OLText
        font="Proxima-Nova-Bold regular"
        size={16}
        style={{
          textAlign: 'center',
          color: 'white',
        }}>
        {competitions[0].date &&
          dateToReadable(new Date(competitions[0].date).toISOString())}
      </OLText>

      <OLSafeAreaView>
        <OLCard
          style={{
            marginTop: px(16),
            width: '100%',
          }}>
          {competitions.map((comp, index) =>
            renderListItem(comp, index, competitions.length),
          )}
        </OLCard>
      </OLSafeAreaView>
    </React.Fragment>
  );

  const innerNothing = () => (
    <React.Fragment>
      <OLText
        font="Rift Bold"
        size={18}
        style={{
          color: 'white',
          textAlign: 'center',
        }}>
        {t('home.nothingToday')}
      </OLText>
    </React.Fragment>
  );

  return (
    <View
      style={{
        padding: px(16),
        backgroundColor: colors.MAIN,
      }}>
      {nothingToday ? innerNothing() : innerCompetitions()}
    </View>
  );
};
