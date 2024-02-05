import { dateToReadable } from '~/util/date';
import { OLCard } from '../card';
import { OLSafeAreaView } from '../safeArea';
import { OLText } from '../text';
import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { TRPCQueryOutput } from '~/lib/trpc/client';

type Props = {
  competitions: TRPCQueryOutput['getTodaysCompetitions']['today'];
  renderListItem: (
    comp: TRPCQueryOutput['getTodaysCompetitions']['today'][0],
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
    <>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <OLText
          bold
          uppercase
          size={18}
          style={{
            textAlign: 'center',
            color: 'white',
          }}
        >
          {t('home.today')}
        </OLText>

        <OLText
          size={16}
          style={{
            textAlign: 'center',
            color: 'white',
          }}
        >
          {competitions[0].date &&
            dateToReadable(new Date(competitions[0].date).toISOString())}
        </OLText>
      </View>

      <OLSafeAreaView>
        <OLCard
          style={{
            marginTop: px(8),
            width: '100%',
            padding: 0,
          }}
        >
          {competitions.map((comp, index) =>
            renderListItem(comp, index, competitions.length),
          )}
        </OLCard>
      </OLSafeAreaView>
    </>
  );

  const innerNothing = () => (
    <OLText
      bold
      uppercase
      size={18}
      style={{
        color: 'white',
        textAlign: 'center',
      }}
    >
      {t('home.nothingToday')}
    </OLText>
  );

  return (
    <View
      style={{
        padding: px(16),
        backgroundColor: colors.MAIN,
      }}
    >
      {nothingToday ? innerNothing() : innerCompetitions()}
    </View>
  );
};
