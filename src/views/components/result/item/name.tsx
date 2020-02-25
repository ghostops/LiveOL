import * as React from 'react';
import { View, Text } from 'native-base';
import { UNIT } from 'util/const';

interface Props {
    name: string;
}

export const OLResultName: React.SFC<Props> = ({ name }) => (
    <Text numberOfLines={1} style={{
        textAlign: 'left',
        fontSize: UNIT,
        flex: 1,
    }}>
        {name}
    </Text>
);
