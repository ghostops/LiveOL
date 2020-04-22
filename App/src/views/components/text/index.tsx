import * as React from 'react';
import { Text } from 'native-base';
import { TextStyle } from 'react-native';
import { fontPx } from 'util/const';

interface Props {
    size: number;
    font: 'Proxima_Nova_Bold' | 'Proxima_Nova' | 'Rift_Bold' | 'Rift_Bold_Italic';
    style?: TextStyle;
    numberOfLines?: number;
    selectable?: boolean;
}

export const OLText: React.SFC<Props> = (props) => {
    return (
        <Text
            {...props}
            style={{
                color: '#141823',
                fontSize: fontPx(props.size),
                fontFamily: props.font,
                ...props.style,
            }}
        >
            {props.children}
        </Text>
    );
};
