import * as React from 'react';
import { View, Text } from 'native-base';
import { UNIT, COLORS } from 'util/const';

interface Props {
    club: string;
}

export const OLResultClub: React.SFC<Props> = ({ club }) => (
    <Text numberOfLines={1} style={{
        color: COLORS.DARK,
        fontSize: UNIT,
    }}>
        {club}
    </Text>
);
