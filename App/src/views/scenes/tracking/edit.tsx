import { View, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS } from '~/util/const';
import { OLText } from '~/views/components/text';
import { useOLNavigation } from '~/hooks/useNavigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { RootStack } from '~/lib/nav/router';
import { OLTrackingForm } from '~/views/components/tracking/form';
import { useTheme } from '~/hooks/useTheme';
import { useTranslation } from 'react-i18next';

export const OLSceneEditTrackRunner: React.FC<{
  route: RouteProp<RootStack, 'EditTrackRunner'>;
}> = ({ route }) => {
  const { goBack } = useOLNavigation();
  const { px } = useTheme();
  const { t } = useTranslation();

  const mode = route.params?.mode || 'create';
  const trackingId = route.params?.trackingId;
  const initialRunner = route.params?.runner;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}
      edges={['bottom', 'left', 'right']}
    >
      <ScrollView
        style={{ flex: 1, padding: px(16) }}
        contentContainerStyle={{ paddingBottom: px(256) }}
      >
        <OLTrackingForm
          mode={mode}
          trackingId={trackingId}
          initialRunner={initialRunner}
        />

        {/* Cancel Button */}
        <View style={{ marginTop: px(12) }}>
          <TouchableOpacity
            onPress={goBack}
            style={{
              padding: px(16),
              alignItems: 'center',
            }}
          >
            <OLText size={16} style={{ color: COLORS.GRAY }}>
              {t('Cancel')}
            </OLText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
