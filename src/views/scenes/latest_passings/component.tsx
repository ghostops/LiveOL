import * as React from 'react';
import { Cache } from 'lib/cache';
import { getPasses } from 'lib/api';
import { OLLastPassingResult } from 'views/components/latest_passings/listItem';
import { ScrollView, RefreshControl, TextStyle } from 'react-native';
import { UNIT, COLORS, px } from 'util/const';
import * as NB from 'native-base';
import { Lang } from 'lib/lang';
import { OLSafeAreaView } from 'views/components/safeArea';

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
    landscape: boolean;
}

export const OLPassings: React.SFC<Props> = (props) => {
    const [loading, setLoading] = React.useState(false);

    if (!props.passings) {
        return <Spinner color={COLORS.MAIN} />;
    }

    return (
        <OLSafeAreaView>
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
                        padding: px(20),
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

                    <View
                        style={{
                            flexDirection: (
                                props.landscape
                                ? 'row'
                                : 'column'
                            ),
                        }}
                    >
                        {props.passings.map((passing, index) =>
                            <OLLastPassingResult
                                key={index}
                                passing={passing}
                                landscape={props.landscape}
                            />)}
                    </View>

                    <Text style={{
                        paddingTop: UNIT,
                        textAlign: 'center',
                    }}>
                        {Lang.print('competitions.passings.info')}
                    </Text>
                </View>
            </ScrollView>
        </OLSafeAreaView>
    );
};
