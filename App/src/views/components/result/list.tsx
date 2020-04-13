import * as React from 'react';
import _ from 'lodash';
import { Col, Grid } from 'react-native-easy-grid';
import { FlatList } from 'react-native-gesture-handler';
import { Lang } from 'lib/lang';
import { OLResultColumn } from './item/column';
import { OLResultItem } from './item';
import { OLSafeAreaView } from '../safeArea';
import { Result } from 'lib/graphql/fragments/types/Result';
import { ResultBox } from './result';
import { ResultHeader } from './header';
import { ScrollView, RefreshControl } from 'react-native';
import { UNIT, COLORS, px } from 'util/const';
import { View, Spinner } from 'native-base';
import { OLText } from '../text';

interface Props {
    results: Result[];

    competitionId: number;
    className: string;
}

export const ResultList: React.SFC<Props> = (props) => {
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
                ListHeaderComponent={(
                    <ResultHeader
                        className={props.className}
                        competitionId={props.competitionId}
                    />
                )}
                ListFooterComponent={<View style={{ height: 45 }} />}
                data={props.results}
                renderItem={renderResult}
                keyExtractor={(item: Result) => item.name}
                ListEmptyComponent={(
                    <View
                        style={{
                            paddingVertical: px(50),
                        }}
                    >
                        <OLText
                            font="Proxima_Nova_Bold"
                            size={18}
                            style={{
                                textAlign: 'center',
                            }}
                        >
                            {Lang.print('classes.empty')}
                        </OLText>
                    </View>
                )}
            />
        </OLSafeAreaView>
    );
};
