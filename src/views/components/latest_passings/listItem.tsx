import * as React from 'react';
import { px, fontPx } from 'util/const';
import { TextStyle } from 'react-native';
import * as NB from 'native-base';
import { Lang } from 'lib/lang';

const {
    View,
    Spinner,
    Text,
    Body,
    CardItem,
    Card,
    Title,
} = NB;

interface Props {
    passing: Passing;
    landscape?: boolean;
}

const TEXT_STYLE: TextStyle = {
    fontSize: fontPx(16),
    paddingVertical: px(8),
};

export const OLLastPassingResult: React.SFC<Props> = ({ passing, landscape }) => {
    return (
        <Card
            key={passing.time + passing.runnerName}
            style={{ flex: 1 }}
        >
            <CardItem>
                <Body
                    style={{
                        flexDirection: 'row',
                    }}
                >
                    <View>
                        <Text
                            style={TEXT_STYLE}
                        >
                            {Lang.print('competitions.passings.class')}:
                        </Text>
                        <Text
                            style={TEXT_STYLE}
                        >
                            {Lang.print('competitions.passings.name')}:
                        </Text>
                        <Text
                            style={TEXT_STYLE}
                        >
                            {Lang.print('competitions.passings.passTime')}:
                        </Text>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            paddingLeft: landscape ? px(8) : px(16),
                        }}
                    >
                        <Text
                            style={TEXT_STYLE}
                        >
                            {passing.class}
                        </Text>
                        <Text
                            style={TEXT_STYLE}
                            numberOfLines={1}
                        >
                            {passing.runnerName}
                        </Text>
                        <Text
                            style={TEXT_STYLE}
                        >
                            {passing.passtime}
                        </Text>
                    </View>
                </Body>
            </CardItem>
        </Card>
    );
};
