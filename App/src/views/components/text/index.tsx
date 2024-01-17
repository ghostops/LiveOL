import * as React from 'react';
import { TextStyle, Text, Platform } from 'react-native';
import { useTextStore } from '~/store/text';
import { fontPx } from '~/util/const';

interface Props {
  size: number;
  bold?: boolean;
  italics?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
  selectable?: boolean;
  uppercase?: boolean;
  mono?: boolean;
  children?:
    | string
    | number
    | string[]
    | number[]
    | React.ReactNode
    | React.ReactNode[];
}

const monoFont = Platform.OS === 'ios' ? 'Courier' : 'monospace';

export const OLText: React.FC<Props> = props => {
  const { textSizeMultiplier } = useTextStore();

  return (
    <Text
      {...props}
      style={{
        color: '#141823',
        fontSize: fontPx(props.size * textSizeMultiplier),
        fontWeight: props.bold ? 'bold' : 'normal',
        fontStyle: props.italics ? 'italic' : 'normal',
        textTransform: props.uppercase ? 'uppercase' : 'none',
        fontFamily: props.mono ? monoFont : undefined,
        ...props.style,
      }}
    >
      {props.children}
    </Text>
  );
};
