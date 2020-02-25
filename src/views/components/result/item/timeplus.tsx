import * as React from 'react';
import { View, Text } from 'native-base';
import { UNIT } from 'util/const';
import { statusI18n } from 'lib/lang/status';

interface Props {
    timeplus: string;
    status: number;
}

export const OLResultTimeplus: React.SFC<Props> = ({ timeplus, status }) => {
    if (status < 0) {
        return null;
    }

    return (
        <Text style={{
            fontSize: (
                status === 0
                ? UNIT
                : UNIT * .75
            ),
            textAlign: 'right',
        }}>
            {
                status === 0
                ? timeplus
                : `(${statusI18n(status, 'long')})`
            }
        </Text>
    );
};
