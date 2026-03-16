import * as React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS } from '~/util/const';
import { OLText } from '../text';

interface Props {
  onPress?: () => void;
  onLongPress?: () => void;
  small?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  beforeText?: React.ReactNode;
  afterText?: React.ReactNode;
  children: string;
}

export const OLButton: React.FC<Props> = props => {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      disabled={props.disabled}
      onLongPress={props.onLongPress}
      style={[
        {
          justifyContent: 'center',
          backgroundColor: COLORS.MAIN,
          opacity: props.disabled ? 0.35 : 1,
          borderRadius: 4,
          paddingHorizontal: 10,
          paddingVertical: props.small ? 6 : 12,
          alignItems: 'center',
        },
        props.style,
      ]}
    >
      {props.beforeText}
      <OLText
        bold
        size={props.small ? 14 : 16}
        style={{
          color: 'white',
        }}
      >
        {props.children}
      </OLText>
      {props.afterText}
    </TouchableOpacity>
  );
};
