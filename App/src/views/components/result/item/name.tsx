import * as React from 'react';
import { View, Text } from 'native-base';
import { fontPx } from 'util/const';

interface Props {
    name: string;
}

export const OLResultName: React.FC<Props> = ({ name }) => (
    <Text numberOfLines={1} style={{
        textAlign: 'left',
        fontSize: fontPx(16),
    }}>
        {name}
    </Text>
);
