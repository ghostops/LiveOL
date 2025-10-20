import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { OLText } from '~/views/components/text';

export const OLSceneTracking = () => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.WHITE,
      }}
    >
      <OLText>Tracking Scene</OLText>
    </View>
  );
};
