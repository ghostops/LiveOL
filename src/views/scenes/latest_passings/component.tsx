import * as React from 'react';
import { Cache } from 'lib/cache';
import { getPasses } from 'lib/api';
import { OLLastPassingResult } from 'views/components/latest_passings/listItem';
import { ScrollView, RefreshControl, TextStyle } from 'react-native';
import { UNIT, COLORS } from 'util/const';
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
    passings: Passing[];
    refresh: () => Promise<void>;
}

export const OLPassings: React.SFC<Props> = (props) => {
    const [loading, setLoading] = React.useState(false);

    if (!props.passings) {
        return <Spinner color={COLORS.MAIN} />;
    }

    return (
        <ScrollView
            refreshControl={
                <RefreshControl
                    onRefresh={async () => {
                        setLoading(true);
                        await props.refresh();
                        setLoading(false);
                    }}
                    refreshing={loading}
                    colors={[COLORS.MAIN]}
                    tintColor={COLORS.MAIN}
                />
            }
        >
            <View
                style={{
                    padding: UNIT,
                }}
            >
                <Title style={{
                    textAlign: 'left',
                    fontSize: UNIT * 1.35,
                    marginVertical: 10,
                    color: 'black',
                }}>
                    {Lang.print('competitions.passings.title')}
                </Title>

                {props.passings.map((passing, index) =>
                    <OLLastPassingResult
                        key={index}
                        passing={passing}
                    />)}

                <Text style={{
                    paddingTop: UNIT,
                    textAlign: 'center',
                }}>
                    {Lang.print('competitions.passings.info')}
                </Text>
            </View>
        </ScrollView>
    );
};
