import * as React from 'react';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { dateToReadable } from 'util/date';
import { Lang } from 'lib/lang';
import { OLCard } from '../card';
import { OLSafeAreaView } from '../safeArea';
import { OLText } from '../text';
import { View } from 'react-native';
import { useTheme } from 'hooks/useTheme';

interface Props {
  competitions: Competition[];
  renderListItem: (
    comp: Competition,
    index?: number,
    total?: number,
  ) => React.ReactChild;
}

export const TodaysCompetitions: React.FC<Props> = ({
  competitions,
  renderListItem,
}) => {
  const { px, colors } = useTheme();

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
        {Lang.print('home.today')}
      </OLText>

      <OLText
        font="Proxima-Nova-Bold regular"
        size={16}
        style={{
          textAlign: 'center',
          color: 'white',
        }}>
        {dateToReadable(new Date(competitions[0].date).toISOString())}
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
        font="Rift-Bold-Italic regular"
        size={18}
        style={{
          color: 'white',
          textAlign: 'center',
        }}>
        {Lang.print('home.nothingToday')}
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
