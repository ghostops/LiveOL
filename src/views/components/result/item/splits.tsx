import * as React from 'react';
import { View, Text } from 'native-base';
import * as Helpers from '../helpers';
import { fontPx } from 'util/const';

interface Props {
    split: ParsedSplit;
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
                {Helpers.splitTimestampToReadable(split.time)}
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
                {Helpers.timeplusToReadable(split.timeplus)}
            </Text>
        </View>
    );
};
