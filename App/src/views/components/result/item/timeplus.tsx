import * as React from 'react';
import { fontPx } from 'util/const';
import { statusI18n } from 'lib/lang/status';
import { View, Text } from 'native-base';

interface Props {
    timeplus: string;
    status: number;
}

export const OLResultTimeplus: React.SFC<Props> = ({ timeplus, status }) => {
    if (
        status < 0 ||
        status === 10 ||
        status === 9
    ) {
        return null;
    }

    return (
        <Text style={{
            fontSize: (
                status === 0
                ? fontPx(14)
                : fontPx(12)
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
