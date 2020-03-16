import * as React from 'react';
import { View, Badge, Text } from 'native-base';
import { COLORS, fontPx } from 'util/const';

interface Props {
    place: string;
}

export const OLResultBadge: React.SFC<Props> = ({ place }) => (
    <View style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
    }}>
        {
            place.length > 0 &&
            place !== '-' &&
            <Badge style={{ backgroundColor: COLORS.MAIN }}>
                <Text style={{
                    fontSize: fontPx(12),
                }}>
                    {place}
                </Text>
            </Badge>
        }
    </View>
);
