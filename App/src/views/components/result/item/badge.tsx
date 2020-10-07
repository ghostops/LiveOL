import * as React from 'react';
import { View, Badge, Text } from 'native-base';
import { COLORS, fontPx } from 'util/const';
import { OLText } from '../../../components/text';

interface Props {
    place: string;
}

export const OLResultBadge: React.FC<Props> = ({ place }) => (
    <View style={{
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
    }}>
        {
            place.length > 0 &&
            place !== '-' &&
            <Badge style={{ backgroundColor: COLORS.MAIN }}>
                <OLText size={12} font="Proxima_Nova">
                    {place}
                </OLText>
            </Badge>
        }
    </View>
);
