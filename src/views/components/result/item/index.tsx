import * as React from 'react';
import { Grid } from 'react-native-easy-grid';
import { connect } from 'react-redux';
import { ListItem, View, Text, Badge } from 'native-base';
import { OLResultAnimation } from './animation';
import { OLResultBadge } from './badge';
import { OLResultClub } from './club';
import { OLResultColumn } from './column';
import { OLResultName } from './name';
import { OLResultTime } from './time';
import { OLResultTimeplus } from './timeplus';
import { ScreenOrientation } from 'expo';
import { UNIT, COLORS } from 'util/const';
import { OLSplits } from './splits';

interface OwnProps {
    result: Result;
}

interface StateProps {
    rotation: ScreenOrientation.Orientation;
}

type Props = StateProps & OwnProps;

export const SIZE = {
    landscape: [
        8,
        22,
        20,
    ],
    portrait: [
        15,
        50,
        35,
    ],
};

const Component: React.SFC<Props> = ({ result, rotation }) => {
    const landscape = rotation === ScreenOrientation.Orientation.LANDSCAPE;
    const size = landscape ? SIZE.landscape : SIZE.portrait;

    const overflowSize = size.reduce((a, b) => a + b, 0);

    return (
        <OLResultAnimation
            result={result}
        >
            <ListItem
                style={{
                    flexDirection: 'row',
                    marginLeft: 0,
                    height: 85,
                    paddingHorizontal: 10,
                }}
            >
                <Grid>
                    <OLResultColumn size={size[0]}>
                        <OLResultBadge place={result.place} />
                    </OLResultColumn>

                    <OLResultColumn size={size[1]}>
                        <OLResultName name={result.name} />

                        <OLResultClub club={result.club} />
                    </OLResultColumn>

                    {
                        landscape &&
                        result.parsedSplits.map((split) => {
                            return (
                                <OLResultColumn
                                    size={overflowSize / result.parsedSplits.length}
                                    key={`${split.name}:${result.name}`}
                                    align="center"
                                >
                                    <OLSplits split={split} />
                                </OLResultColumn>
                            );
                        })
                    }

                    <OLResultColumn
                        align="flex-end"
                        size={size[2]}
                    >
                        <OLResultTime
                            status={result.status}
                            time={result.result}
                        />

                        <View style={{ height: UNIT / 4 }} />

                        <OLResultTimeplus
                            status={result.status}
                            timeplus={result.timeplus}
                        />
                    </OLResultColumn>
                </Grid>
            </ListItem>
        </OLResultAnimation>
    );
};

const mapStateToProps = (state: AppState): StateProps => ({
    rotation: state.general.rotation,
});

export const OLResultItem = connect(mapStateToProps, null)(Component);
