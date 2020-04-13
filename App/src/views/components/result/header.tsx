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
import { SIZE } from './item';
import { Split } from 'lib/graphql/fragments/types/Split';
import { Text, View } from 'native-base';
import { UNIT } from 'util/const';
import { useQuery } from '@apollo/react-hooks';

interface OwnProps {
    competitionId: number;
    className: string;
}

interface StateProps {
    rotation: ScreenOrientation.Orientation;
}

const labels = (landscape: boolean, splits?: Split[]) => {
    const size = landscape ? SIZE.landscape : SIZE.portrait;

    const overflowSize = Object.keys(size).map((k) => size[k]).reduce((a, b) => a + b, 0);

    const all = {
        place: { size: size.place, text: Lang.print('classes.header.place') },
        name: { size: size.name, text: Lang.print('classes.header.name') },
        time: { size: size.time, text: Lang.print('classes.header.time'), align: 'flex-end' },
        start: { size: size.start, text: Lang.print('classes.header.start') },
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
        ...splits.map((s) => ({
            size: (overflowSize / splits.length),
            text: s.name,
        })),
        all.time,
    ];

    return landscape ? inLandscape : inPortrait;
};

const Component: React.SFC<StateProps & OwnProps> = ({ rotation, className, competitionId }) => {
    const landscape = rotation === ScreenOrientation.Orientation.LANDSCAPE;

    const { data, loading, error } =
        useQuery<GetSplitControls, GetSplitControlsVariables>(
            GET_SPLIT_CONTROLS,
            { variables: { competitionId, className } },
        );

    const splits: Split[] = _.get(data, 'results.getSplitControls', []);

    const renderCol = ({ text, size, align }, index) => {
        const key = `${text}:${index}`;

        return (
            <OLResultColumn
                size={size}
                key={key}
                align={align || (landscape ? 'center' : 'flex-start')}
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
                paddingHorizontal: 20,
            }}
        >
            {
                (!loading && !error) &&
                <Grid>
                    {labels(landscape, splits).map(renderCol)}
                </Grid>
            }
        </View>
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    rotation: state.general.rotation,
});

export const ResultHeader = connect(mapStateToProps, null)(Component);
