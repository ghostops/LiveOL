import { View } from 'react-native';
import { $api } from '~/lib/react-query/api';
import { OLText } from './text';
import { useTheme } from '~/hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { OLIcon } from './icon';

export const OLApiStatus = () => {
  const { px, colors } = useTheme();
  const { t } = useTranslation();

  const apiStatusQuery = $api.useQuery(
    'get',
    '/v2/status',
    {},
    { refetchInterval: 60_000 },
  );

  const liveresultatIsDown =
    apiStatusQuery.data?.data.status.liveresultat === false;

  if (!liveresultatIsDown) {
    return null;
  }

  return (
    <View
      style={{
        padding: px(8),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.DARK,
        gap: px(4),
      }}
    >
      <OLIcon name="warning" size={px(24)} color={colors.WHITE} />
      <OLText style={{ color: colors.WHITE }}>
        {t('liveresultat.orientering.se is currently experiencing issues')}
      </OLText>
    </View>
  );
};
