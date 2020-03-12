import * as React from 'react';
import { OLResultColumn } from './item/column';
import { Text, View } from 'native-base';
import { Grid } from 'react-native-easy-grid';
import { connect } from 'react-redux';
import { ScreenOrientation } from 'expo';
import { SIZE } from './item';
import { randomColor } from 'util/random';
import { UNIT } from 'util/const';

interface OwnProps {
    splits: SplitControl[];
}

interface StateProps {
    rotation: ScreenOrientation.Orientation;
}

const labels = (landscape: boolean, splits?: SplitControl[]) => {
    const size = landscape ? SIZE.landscape : SIZE.portrait;

    const overflowSize = Object.keys(size).map((k) => size[k]).reduce((a, b) => a + b, 0);

    const all = {
        place: { size: size.place, text: '#' },
        name: { size: size.name, text: 'Namn' },
        time: { size: size.time, text: 'Tid', align: 'flex-end' },
        start: { size: size.start, text: 'Start' },
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

const Component: React.SFC<StateProps & OwnProps> = ({ rotation, splits }) => {
    const landscape = rotation === ScreenOrientation.Orientation.LANDSCAPE;

    const renderCol = ({ text, size, align }, index) => {
        const key = `${text}:${index}`;

        return (
            <OLResultColumn
                size={size}
                key={key}
                align={align}
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
            <Grid>
                {labels(landscape, splits).map(renderCol)}
            </Grid>
        </View>
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    rotation: state.general.rotation,
});

export const ResultHeader = connect(mapStateToProps, null)(Component);
