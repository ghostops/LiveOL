import * as React from 'react';
import { UNIT } from 'util/const';
import { View, Text } from 'native-base';
import * as Helpers from '../helpers';

interface Props {
    time: number;
}

export const OLStartTime: React.SFC<Props> = ({ time }) => (
    <View
        style={{
            flex: 1,
        }}
    >
        <Text style={{
            fontSize: UNIT,
        }}>
            {Helpers.startToReadable(time)}
        </Text>
    </View>
);
