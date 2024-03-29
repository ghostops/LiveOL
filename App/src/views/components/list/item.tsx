import * as React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, px } from '~/util/const';

interface Props {
  itemDivider?: boolean;
  style?: ViewStyle;
  onPress?: () => any;
  onLongPress?: () => void;
  children: React.ReactNode;
}

export const OLListItem: React.FC<Props> = ({
  children,
  style,
  onPress,
  onLongPress,
  itemDivider,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={itemDivider ? 1 : 0.75}
      style={{
        backgroundColor: itemDivider ? COLORS.BORDER : 'white',
        padding: px(10),
        borderBottomColor: COLORS.BORDER,
        borderBottomWidth: 1,
        justifyContent: 'center',
        ...style,
      }}
    >
      {children}
    </TouchableOpacity>
  );
};
