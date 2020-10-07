import * as React from 'react';
import { View, Text } from 'native-base';
import { UNIT, COLORS, fontPx } from 'util/const';

interface Props {
    club: string;
}

export const OLResultClub: React.FC<Props> = ({ club }) => (
    <Text numberOfLines={1} style={{
        color: 'grey',
        fontSize: fontPx(16),
    }}>
        {club}
    </Text>
);
