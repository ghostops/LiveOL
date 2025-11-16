import { TouchableOpacity } from 'react-native';
import { OLIcon } from './icon';
import { useOLNavigation } from '~/hooks/useNavigation';

export const TrackingInfoIcon = ({ color }: { color: string }) => {
  const { navigate } = useOLNavigation();
  return (
    <TouchableOpacity onPress={() => navigate('TrackingInfo')}>
      <OLIcon name="information-circle-outline" size={24} color={color} />
    </TouchableOpacity>
  );
};
