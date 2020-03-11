import * as React from 'react';
import { OLResultColumn } from './item/column';
import { Text, View } from 'native-base';
import { Grid } from 'react-native-easy-grid';
import { connect } from 'react-redux';
import { ScreenOrientation } from 'expo';
import { SIZE } from './item';
import { randomColor } from 'util/random';

interface OwnProps {
    splits: SplitControl[];
}

interface StateProps {
    rotation: ScreenOrientation.Orientation;
}

const Component: React.SFC<StateProps & OwnProps> = ({ rotation, splits }) => {
    const landscape = rotation === ScreenOrientation.Orientation.LANDSCAPE;
    const size = landscape ? SIZE.landscape : SIZE.portrait;

    const overflowSize = size.reduce((a, b) => a + b, 0);

    const labels = [
        { size: size[0], text: '#' },
        { size: size[1], text: 'Namn' },
        ...(
            landscape
            ? splits.map((s) => ({
                size: (overflowSize / splits.length),
                text: s.name,
                align: 'center',
            })) : []
        ),
        { size: size[2], text: 'Tid', align: 'flex-end' },
    ];

    const renderCol = ({ text, size, align }) => {
        return (
            <OLResultColumn
                size={size}
                key={text}
                align={align}
            >
                <Text>
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
                {labels.map(renderCol)}
            </Grid>
        </View>
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    rotation: state.general.rotation,
});

export const ResultHeader = connect(mapStateToProps, null)(Component);
