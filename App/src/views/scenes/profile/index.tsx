import { Alert, ScrollView, View } from 'react-native';
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
import { useChangelogStore } from '~/store/changelog';

export const OLProfile: React.FC = () => {
  const { t } = useTranslation();
  const { navigate } = useOLNavigation();
  const { plusActive } = useIap();
  const { reset } = useChangelogStore();

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
      <View
        style={{
          justifyContent: 'flex-end',
          flexDirection: 'row',
          gap: px(8),
          flex: 1,
        }}
      >
        <OLButton
          small
          onPress={() => navigate('Changelog')}
          onLongPress={() => {
            reset();
            Alert.alert('ChangeLogReset');
          }}
          afterText={
            <OLIcon
              name="newspaper-outline"
              size={px(14)}
              color={COLORS.WHITE}
            />
          }
          style={{ flexDirection: 'row', gap: px(4) }}
        >
          {t("What's New")}
        </OLButton>

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
