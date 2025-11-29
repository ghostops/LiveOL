import { TouchableOpacity, useColorScheme, View } from 'react-native';
import { OLIcon } from './icon';
import { useOLNavigation } from '~/hooks/useNavigation';
import { COLORS, HAS_LIQUID_GLASS } from '~/util/const';

export const TrackingInfoIcon = ({
  color,
  isHeader = false,
}: {
  color: string;
  isHeader?: boolean;
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const c =
    !isDark && HAS_LIQUID_GLASS && color === COLORS.WHITE
      ? COLORS.BLACK
      : color;
  const { navigate } = useOLNavigation();
  return (
    <View
      style={{
        left: isHeader && HAS_LIQUID_GLASS ? 6 : 0,
      }}
    >
      <TouchableOpacity onPress={() => navigate('TrackingInfo')}>
        <OLIcon name="information-circle-outline" size={24} color={c} />
      </TouchableOpacity>
    </View>
  );
};
