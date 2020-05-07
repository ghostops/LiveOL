import * as React from 'react';
import { fontPx } from 'util/const';
import { View, Text } from 'native-base';

interface Props {
    time: string;
}

export const OLStartTime: React.SFC<Props> = ({ time }) => (
    <View
        style={{
            flex: 1,
        }}
    >
        <Text style={{
            fontSize: fontPx(16),
        }}>
            {time}
        </Text>
    </View>
);
