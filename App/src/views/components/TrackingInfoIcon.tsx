import { TouchableOpacity, View } from 'react-native';
import { OLIcon } from './icon';
import { useOLNavigation } from '~/hooks/useNavigation';
import { COLORS, HAS_LIQUID_GLASS } from '~/util/const';

export const TrackingInfoIcon = ({ color }: { color: string }) => {
  const c = HAS_LIQUID_GLASS && color === COLORS.WHITE ? COLORS.BLACK : color;
  const { navigate } = useOLNavigation();
  return (
    <View
      style={{
        left: HAS_LIQUID_GLASS ? 6 : 0,
      }}
    >
      <TouchableOpacity onPress={() => navigate('TrackingInfo')}>
        <OLIcon name="information-circle-outline" size={24} color={c} />
      </TouchableOpacity>
    </View>
  );
};
