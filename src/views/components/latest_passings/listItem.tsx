import * as React from 'react';
import { TextStyle } from 'react-native';
import { UNIT } from 'util/const';
import * as NB from 'native-base';
import Lang from 'lib/lang';

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
}

const TEXT_STYLE: TextStyle = {
    fontSize: UNIT,
    paddingVertical: UNIT / 2,
};

export const OLLastPassingResult: React.SFC<Props> = ({ passing }) => {
    return (
        <Card key={passing.time + passing.runnerName}>
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
                            paddingLeft: UNIT,
                        }}
                    >
                        <Text
                            style={TEXT_STYLE}
                        >
                            {passing.class}
                        </Text>
                        <Text
                            style={TEXT_STYLE}
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
