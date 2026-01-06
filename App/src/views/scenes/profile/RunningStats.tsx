import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { $api } from '~/lib/react-query/api';
import { useUserIdStore } from '~/store/userId';
import { COLORS, px } from '~/util/const';
import { OLCard } from '~/views/components/card';
import { OLText } from '~/views/components/text';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export const RunningStats: React.FC = () => {
  const { t } = useTranslation();
  const uid = useUserIdStore(state => state.userId);

  const { data, isLoading, isError, refetch } = $api.useQuery(
    'get',
    '/v2/tracking/stats',
    {
      params: {
        query: { uid },
      },
    },
    { enabled: !!uid },
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (isLoading || isError || !data?.data.stats) {
    return null;
  }

  const stats = data.data.stats;

  if (stats.racesEntered === 0) {
    return (
      <View>
        <OLCard>
          <OLText size={16} bold>
            {t('Your race statistics')}
          </OLText>
          <OLText size={14} style={{ marginTop: px(8) }}>
            {t(
              "We haven't found you in any races yet. Your race statistics will appear here once you start participating in live events.",
            )}
          </OLText>

          <OLText
            bold
            size={14}
            style={{ marginTop: px(8), color: COLORS.DARK }}
          >
            {t(
              'Maybe you need to refine your tracking profile to ensure we can find your results?',
            )}
          </OLText>
        </OLCard>
      </View>
    );
  }

  const hoursSpent = (stats.totalTimeMs / 1000 / 60 / 60).toFixed(1);

  return (
    <OLCard>
      <OLText size={16} bold style={{ marginBottom: px(12) }}>
        {t('Your race statistics')}
      </OLText>

      <View style={{ gap: px(10) }}>
        <StatRow
          label={t('Races entered')}
          value={stats.racesEntered.toString()}
          icon="🏃"
        />
        <StatRow
          label={t('Split controls taken')}
          value={stats.splitControlsTaken.toString()}
          icon="📍"
        />
        <StatRow
          label={t('Time spent running')}
          value={`${hoursSpent} ${t('hours')}`}
          icon="⏱️"
          border={stats.averagePosition !== null}
        />
        {stats.averagePosition !== null && (
          <StatRow
            label={t('Average position')}
            value={stats.averagePosition.toString()}
            icon="🏆"
            border={false}
          />
        )}
      </View>
    </OLCard>
  );
};

interface StatRowProps {
  label: string;
  value: string;
  icon: string;
  border?: boolean;
}

const StatRow: React.FC<StatRowProps> = ({
  label,
  value,
  icon,
  border = true,
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: px(4),
        borderBottomWidth: border ? 1 : 0,
        borderBottomColor: COLORS.BORDER,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: px(8) }}>
        <OLText size={18}>{icon}</OLText>
        <OLText size={14}>{label}</OLText>
      </View>
      <OLText size={14} bold style={{ color: COLORS.MAIN }}>
        {value}
      </OLText>
    </View>
  );
};
