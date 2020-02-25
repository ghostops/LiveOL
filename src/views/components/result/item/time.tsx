import * as React from 'react';
import { View, Text } from 'native-base';
import { UNIT } from 'util/const';
import { statusI18n } from 'lib/lang/status';

interface Props {
    time: string;
    status: number;
}

export const OLResultTime: React.SFC<Props> = ({ time, status }) => (
    <Text style={{
        marginLeft: 10,
        fontSize: UNIT * 1.35,
    }}>
        {
            status === 0
            ? time
            : statusI18n(status)
        }
    </Text>
);
