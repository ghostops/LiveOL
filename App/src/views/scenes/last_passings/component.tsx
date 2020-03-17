import * as React from 'react';
import { API_CACHES_EXPIRY } from 'store/stores/api';
import { Cache } from 'lib/cache';
import { COLORS, px, fontPx } from 'util/const';
import { getPasses } from 'lib/api';
import { Lang } from 'lib/lang';
import { OLLastPassingResult } from 'views/components/latest_passings/listItem';
import { OLRefetcher } from 'views/components/refetcher';
import { OLSafeAreaView } from 'views/components/safeArea';
import { ScrollView, RefreshControl, TextStyle } from 'react-native';
import * as NB from 'native-base';
import { OLLoading } from 'views/components/loading';

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
    loading: boolean;
}

export const OLPassings: React.SFC<Props> = (props) => {
    if (
        props.loading &&
        (!props.passings || !props.passings.length)
    ) {
        return <OLLoading />;
    }

    return (
        <OLSafeAreaView>
            <ScrollView
                refreshControl={
                    <RefreshControl
                        onRefresh={props.refresh}
                        refreshing={props.loading}
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
                        fontSize: fontPx(20),
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
                </View>
            </ScrollView>

            <OLRefetcher
                refetch={props.refresh}
                interval={15000}
                circle
            />
        </OLSafeAreaView>
    );
};
