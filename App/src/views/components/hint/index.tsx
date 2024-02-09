import { TouchableOpacity } from 'react-native';
import { OLText } from '../text';
import { useTheme } from '~/hooks/useTheme';
import { OLIcon } from '../icon';

type Props = {
  children: string;
  onPress?: () => void;
};

export const OLHint: React.FC<Props> = ({ children, onPress }) => {
  const { colors, px } = useTheme();

  return (
    <TouchableOpacity
      style={{
        backgroundColor: colors.BLACK,
        flexDirection: 'row',
        alignItems: 'center',
        padding: px(8),
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <OLIcon name="alert-circle-outline" size={24} color="white" />
      <OLText size={16} style={{ color: 'white', marginLeft: px(8) }}>
        {children}
      </OLText>
    </TouchableOpacity>
  );
};
