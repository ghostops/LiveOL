import * as React from 'react';
import { fontPx } from 'util/const';
import { Split } from 'lib/graphql/fragments/types/Split';
import { View, Text } from 'native-base';
import * as Helpers from '../helpers';

interface Props {
    split: Split;
}

export const OLSplits: React.SFC<Props> = ({ split }) => {
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            <Text style={{
                fontSize: fontPx(14),
            }}>
                {split.time}
                {' '}
                <Text style={{
                    color: 'gray',
                }}>
                    ({split.place})
                </Text>
            </Text>

            <Text style={{
                fontSize: fontPx(12),
                color: 'gray',
            }}>
                {split.timeplus}
            </Text>
        </View>
    );
};
