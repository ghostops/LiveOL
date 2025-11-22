import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { OLTrackingForm } from '~/views/components/tracking/form';

export const UserProfileForm: React.FC = () => {
  const { px } = useTheme();
  return (
    <View>
      <OLTrackingForm
        mode="user"
        initialRunner={undefined}
        trackingId={undefined}
        style={{ gap: px(8) }}
      />
    </View>
  );
};
