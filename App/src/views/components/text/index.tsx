import * as React from 'react';
import { TextStyle, Text } from 'react-native';
import { useTextStore } from 'store/text';
import { fontPx } from 'util/const';

interface Props {
  size: number;
  font:
    | 'Proxima-Nova-Bold regular'
    | 'Proxima Nova Regular'
    | 'Rift Bold'
    | 'PT Mono';
  style?: TextStyle;
  numberOfLines?: number;
  selectable?: boolean;
  children?:
    | string
    | number
    | string[]
    | number[]
    | React.ReactNode
    | React.ReactNode[];
}

export const OLText: React.FC<Props> = props => {
  const { textSizeMultiplier } = useTextStore();

  return (
    <Text
      {...props}
      style={{
        color: '#141823',
        fontSize: fontPx(props.size * textSizeMultiplier),
        fontFamily: props.font,
        ...props.style,
      }}
    >
      {props.children}
    </Text>
  );
};
