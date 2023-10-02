import { IconProps } from 'react-native-vector-icons/Icon';
import Ionicon from 'react-native-vector-icons/Ionicons';

const IoniconNoTypes: any = Ionicon;

export const OLIcon: React.FC<IconProps> = props => {
  return <IoniconNoTypes {...props} />;
};
