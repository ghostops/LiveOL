import * as React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { GET_SPLIT_CONTROLS } from 'lib/graphql/queries/results';
import { GetSplitControls, GetSplitControlsVariables } from 'lib/graphql/queries/types/GetSplitControls';
import { Grid } from 'react-native-easy-grid';
import { Lang } from 'lib/lang';
import { OLResultColumn } from './item/column';
import { randomColor } from 'util/random';
import { ScreenOrientation } from 'expo';
import { Split } from 'lib/graphql/fragments/types/Split';
import { Text, View } from 'native-base';
import { UNIT } from 'util/const';
import { useQuery } from '@apollo/react-hooks';

interface OwnProps {
    competitionId: number;
    className: string;
    table?: boolean;
    maxRowSize?: number;
}

const labels = (table: boolean, maxSize: number, splits?: Split[]) => {
    const all = {
        place: { size: 1, text: Lang.print('classes.header.place') },
        name: { size: 1, text: Lang.print('classes.header.name') },
        time: { size: 1, text: Lang.print('classes.header.time'), align: 'flex-end' },
        start: { size: 1, text: Lang.print('classes.header.start') },
    };

    const inPortrait = [
        all.place,
        all.name,
        all.time,
    ];

    const inLandscape = [
        all.place,
        all.name,
        all.start,
        ...splits.map((s) => ({ text: s.name })),
        all.time,
    ].map((s) => ({ ...s, style: { width: maxSize } }));

    return table ? inLandscape : inPortrait;
};

const Component: React.SFC<OwnProps> = ({ table, className, competitionId, maxRowSize }) => {
    const { data, loading, error } =
        useQuery<GetSplitControls, GetSplitControlsVariables>(
            GET_SPLIT_CONTROLS,
            { variables: { competitionId, className } },
        );

    const splits: Split[] = _.get(data, 'results.getSplitControls', []);

    const renderCol = ({ text, size, align, style }, index) => {
        const key = `${text}:${index}`;

        return (
            <OLResultColumn
                size={size}
                key={key}
                align={align || 'flex-start'}
                style={style}
            >
                <Text
                    numberOfLines={1}
                    style={{
                        fontSize: UNIT,
                        fontWeight: 'bold',
                        color: '#444444',
                    }}
                >
                    {text}
                </Text>
            </OLResultColumn>
        );
    };

    return (
        <View
            style={{
                height: 60,
                flexDirection: 'row',
            }}
        >
            {
                (!loading && !error) &&
                <Grid>
                    {labels(table, maxRowSize || 0, splits).map(renderCol)}
                </Grid>
            }
        </View>
    );
};

const mapStateToProps = (state: AppState) => ({});

export const ResultHeader = connect(
    null,
    null,
)(Component) as unknown as React.ComponentClass<OwnProps>;
