import * as React from 'react';
import _ from 'lodash';
import { Col, Grid } from 'react-native-easy-grid';
import { FlatList } from 'react-native-gesture-handler';
import { Lang } from 'lib/lang';
import { OLResultColumn } from 'views/components/result/item/column';
import { OLTableRow } from 'views/components/result/table/row';
import { OLSafeAreaView } from 'views/components/safeArea';
import { Result } from 'lib/graphql/fragments/types/Result';
import { ResultBox } from 'views/components/result/result';
import { ResultHeader } from 'views/components/result/header';
import { ScrollView, RefreshControl } from 'react-native';
import { UNIT, COLORS, px } from 'util/const';
import { View, Spinner } from 'native-base';
import { OLText } from 'views/components/text';

interface Props {
    results: Result[];

    competitionId: number;
    className: string;
}

export const OLResultsTable: React.FC<Props> = (props) => {
    const renderResult = ({ item }) => {
        const result: Result = item;

        return (
            <OLTableRow
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
            <ScrollView
                horizontal
            >
                <FlatList
                    nestedScrollEnabled
                    ListHeaderComponent={(
                        <ResultHeader
                            className={props.className}
                            competitionId={props.competitionId}
                            maxRowSize={px(200)}
                            table
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
            </ScrollView>
        </OLSafeAreaView>
    );
};
