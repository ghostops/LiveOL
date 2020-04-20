import * as React from 'react';
import { View, Text } from 'native-base';
import { fontPx } from 'util/const';
import { statusI18n } from 'lib/lang/status';

interface Props {
    time: string;
    status: number;
}

export const OLResultTime: React.SFC<Props> = ({ time, status }) => (
    <Text style={{
        fontSize: fontPx(20),
    }}>
        {
            status === 0
            ? time
            : statusI18n(status)
        }
    </Text>
);
