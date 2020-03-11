import * as React from 'react';
import _ from 'lodash';
import { Col, Grid } from 'react-native-easy-grid';
import { FlatList } from 'react-native-gesture-handler';
import { OLResultColumn } from './item/column';
import { OLResultItem } from './item';
import { OLSafeAreaView } from '../safeArea';
import { ResultBox } from './result';
import { ResultHeader } from './header';
import { ScrollView, RefreshControl } from 'react-native';
import { UNIT, COLORS } from 'util/const';
import * as NB from 'native-base';
import Lang from 'lib/lang';

const {
    View,
    Text,
    List,
    Switch,
    Card,
    CardItem,
    Spinner,
} = NB;

interface Props {
    results: Result[];
    splits: SplitControl[];
    subText: 'class' | 'club';
    refetchTimeout: number;
    refetch: () => Promise<void>;
}

export const ResultList: React.SFC<Props> = (props) => {
    const [loading, setLoading] = React.useState(false);

    let interval: NodeJS.Timeout;

    React.useEffect(
        () => {
            startPoll();

            return () => {
                clearPoll();
            };
        },
        [],
    );

    const poll = async () => {
        await props.refetch();
    };

    const startPoll = () => interval = setInterval(poll, props.refetchTimeout);
    const clearPoll = () => interval && clearInterval(interval);

    const renderResult = ({ item }) => {
        const result: Result = item;

        return (
            <OLResultItem
                key={result.start + result.name}
                result={result}
            />
        );
    };

    if (!props.results) {
        return <Spinner color={COLORS.MAIN} />;
    }

    return (
        <OLSafeAreaView>
            <FlatList
                refreshControl={
                    <RefreshControl
                        onRefresh={async () => {
                            setLoading(true);
                            await poll();
                            setLoading(false);
                        }}
                        refreshing={loading}
                        colors={[COLORS.MAIN]}
                        tintColor={COLORS.MAIN}
                    />
                }
                ListHeaderComponent={(
                    <ResultHeader
                        {...props}
                    />
                )}
                ListFooterComponent={<View style={{ height: 45 }} />}
                data={props.results}
                renderItem={renderResult}
                keyExtractor={(item: Result) => item.name}
            />
        </OLSafeAreaView>
    );
};
