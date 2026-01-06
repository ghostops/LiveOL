import { ScrollView, View } from 'react-native';
import { OLCard } from '~/views/components/card';
import { COLORS, px } from '~/util/const';
import { useTranslation } from 'react-i18next';
import { UserProfileForm } from './UserProfileForm';
import { SubscriptionManagement } from './SubscriptionManagement';
import { RunningStats } from './RunningStats';
import { useOLNavigation } from '~/hooks/useNavigation';
import { OLButton } from '~/views/components/button';
import { OLIcon } from '~/views/components/icon';
import { useIap } from '~/hooks/useIap';

export const OLProfile: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useOLNavigation();
  const { plusActive } = useIap();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
      }}
      contentContainerStyle={{
        paddingVertical: px(16),
        paddingHorizontal: px(16),
        gap: px(8),
      }}
    >
      <View style={{ alignItems: 'flex-end' }}>
        <OLButton
          small
          onPress={() => navigate('Settings')}
          afterText={
            <OLIcon name="settings-sharp" size={px(14)} color={COLORS.WHITE} />
          }
          style={{ flexDirection: 'row', gap: px(4) }}
        >
          {t('App settings')}
        </OLButton>
      </View>

      {!plusActive && (
        <View>
          <SubscriptionManagement />
        </View>
      )}

      <OLCard>
        <UserProfileForm />
      </OLCard>

      <RunningStats />

      {plusActive && (
        <View>
          <SubscriptionManagement />
        </View>
      )}

      {/* Bottom Spacing */}
      <View style={{ height: px(32) }} />
    </ScrollView>
  );
};
