import * as React from 'react';
import { today } from 'util/date';
import { UNIT, COLORS } from 'util/const';
import * as NB from 'native-base';
import Lang from 'lib/lang';

const {
    List,
    Text,
    View,
    CardItem,
    Card,
    Body,
} = NB;

interface Props {
    competitions: Comp[];
    renderListItem: (comp: Comp, index?: number, total?: number) => React.ReactChild;
}

export const TodaysCompetitions: React.SFC<Props> = ({ competitions, renderListItem }) => {
    const nothingToday = !competitions || competitions.length === 0;

    const innerCompetitions = () => (
        <React.Fragment>
            <Text
                style={{
                    fontSize: UNIT * 1.5,
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                {Lang.print('home.today')}
            </Text>

            <Text
                style={{
                    fontSize: UNIT,
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                }}
            >
                {today()}
            </Text>

            <Card style={{
                marginTop: UNIT,
                width: '100%',
            }}>
                <CardItem>
                    <Body style={{ width: '100%' }}>
                        <List style={{ width: '100%' }}>
                            {
                                competitions.map(
                                    (comp, index) =>
                                        renderListItem(
                                            comp,
                                            index,
                                            competitions.length,
                                        ),
                                )
                            }
                        </List>
                    </Body>
                </CardItem>
            </Card>
        </React.Fragment>
    );

    const innerNothing = () => (
        <React.Fragment>
            <Text
                style={{
                    color: 'white',
                    textAlign: 'center',
                }}
            >
                {Lang.print('home.nothingToday')}
            </Text>
        </React.Fragment>
    );

    return (
        <View
            style={{
                padding: UNIT,
                backgroundColor: COLORS.MAIN,
            }}
        >
            {
                nothingToday
                ? innerNothing()
                : innerCompetitions()
            }
        </View>
    );
};
