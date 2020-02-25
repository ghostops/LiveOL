import * as React from 'react';
import _ from 'lodash';
import { ResultBox } from './result';
import { ScrollView, RefreshControl } from 'react-native';
import { UNIT, COLORS } from 'util/const';
import * as NB from 'native-base';
import Lang from 'lib/lang';
import { OLResultItem } from './item';
import { OLSafeAreaView } from '../safeArea';

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

    const renderResult = (result: Result) => {
        return (
            <OLResultItem
                key={result.start + result.name}
                result={result}
            />
        );
        // return (
        //     <ResultBox
        //         key={result.start + result.name}
        //         result={result}
        //         subtitle={props.subText}
        //     />
        // );
    };

    if (!props.results) {
        return <Spinner color={COLORS.MAIN} />;
    }

    return (
        <OLSafeAreaView>
            <ScrollView
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
            >
                <List style={{
                    backgroundColor: 'white',
                    borderRadius: 4,
                }}>
                    {
                        props.results.length < 1 ?
                        (
                            <Text style={{ textAlign: 'center', paddingVertical: 10 }}>
                                {Lang.print('competitions.noClasses')}
                            </Text>
                        ) : props.results.map(renderResult)
                    }
                </List>

                <View style={{ height: 45 }} />
            </ScrollView>
        </OLSafeAreaView>
    );
}
