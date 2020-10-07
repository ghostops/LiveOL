import * as React from 'react';
import { fontPx } from 'util/const';
import { View, Text } from 'native-base';
import { OLText } from '../../text';

interface Props {
    time: string;
}

export const OLStartTime: React.FC<Props> = ({ time }) => (
    <View
        style={{
            flex: 1,
        }}
    >
        <OLText font="Proxima_Nova" size={16}>
            {time}
        </OLText>
    </View>
);
