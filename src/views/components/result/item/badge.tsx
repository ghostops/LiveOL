import * as React from 'react';
import { View, Badge, Text } from 'native-base';
import { COLORS, UNIT } from 'util/const';

interface Props {
    place: string;
}

export const OLResultBadge: React.SFC<Props> = ({ place }) => (
    <View style={{
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        {
            place.length > 0 &&
            place !== '-' &&
            <Badge style={{ backgroundColor: COLORS.MAIN }}>
                <Text style={{
                    fontSize: UNIT * .85,
                }}>
                    {place}
                </Text>
            </Badge>
        }
    </View>
);
