import { View } from 'react-native';
import { useTheme } from '~/hooks/useTheme';
import { OLText } from '~/views/components/text';

export const OLSceneCompetitionV2 = () => {
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
      <OLText>Competition Scene V2</OLText>
    </View>
  );
};
