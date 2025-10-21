import { Ionicons } from '@react-native-vector-icons/ionicons';

type IconProps = React.ComponentProps<typeof Ionicons>;

export const OLIcon: React.FC<IconProps> = props => {
  return <Ionicons {...props} />;
};
