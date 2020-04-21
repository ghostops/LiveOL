import * as React from 'react';
import { fontPx } from 'util/const';
import { Split } from 'lib/graphql/fragments/types/Split';
import { View, Text } from 'native-base';
import { OLText } from 'views/components/text';

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
            <OLText
                font="Proxima_Nova"
                size={16}
            >
                {split.time}
                {' '}
                <OLText
                    font="Proxima_Nova"
                    size={16}
                    style={{
                        color: 'gray',
                    }}
                >
                    ({split.place})
                </OLText>
            </OLText>

            <OLText
                font="Proxima_Nova"
                size={14}
                style={{
                    color: 'gray',
                }}
            >
                {split.timeplus}
            </OLText>
        </View>
    );
};
