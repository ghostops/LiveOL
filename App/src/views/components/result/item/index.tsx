import * as React from 'react';
import { COLORS, px } from 'util/const';
import { connect } from 'react-redux';
import { Grid } from 'react-native-easy-grid';
import { ListItem, View, Text, Badge } from 'native-base';
import { OLResultAnimation } from './animation';
import { OLResultBadge } from './badge';
import { OLResultClub } from './club';
import { OLResultColumn } from './column';
import { OLResultName } from './name';
import { OLResultTime } from './time';
import { OLResultTimeplus } from './timeplus';
import { OLSplits } from './splits';
import { OLStartTime } from './start';
import { Result } from 'lib/graphql/fragments/types/Result';
import { ScreenOrientation } from 'expo';

interface OwnProps {
    result: Result;
}

interface StateProps {
    rotation: ScreenOrientation.Orientation;
}

type Props = StateProps & OwnProps;

export const SIZE = {
    landscape: {
        place: 7,
        name: 18,
        start: 15,
        time: 12,
    },
    portrait: {
        place: 15,
        name: 50,
        start: 0,
        time: 35,
    },
};

const Component: React.SFC<Props> = ({ result, rotation }) => {
    const landscape = rotation === ScreenOrientation.Orientation.LANDSCAPE;
    const size = landscape ? SIZE.landscape : SIZE.portrait;

    const overflowSize = Object.keys(size).map((k) => size[k]).reduce((a, b) => a + b, 0);

    return (
        <OLResultAnimation
            result={result}
        >
            <ListItem
                style={{
                    flexDirection: 'row',
                    marginLeft: 0,
                    height: px(80),
                    paddingHorizontal: 10,
                }}
            >
                <Grid>
                    <OLResultColumn size={size.place}>
                        <OLResultBadge place={result.place} />
                    </OLResultColumn>

                    <OLResultColumn size={size.name}>
                        <View style={{ flex: 1 }}>
                            <OLResultName name={result.name} />

                            <OLResultClub club={result.club} />
                        </View>
                    </OLResultColumn>

                    {
                        landscape &&
                        <OLResultColumn size={size.start}>
                            <OLStartTime time={result.start} />
                        </OLResultColumn>
                    }

                    {
                        landscape &&
                        result.splits.map((split, index) => {
                            return (
                                <OLResultColumn
                                    size={overflowSize / result.splits.length}
                                    key={split.id}
                                    align="center"
                                >
                                    <OLSplits split={split} />
                                </OLResultColumn>
                            );
                        })
                    }

                    <OLResultColumn
                        align="flex-end"
                        size={size.time}
                    >
                        <OLResultTime
                            status={result.status}
                            time={result.result}
                        />

                        <View style={{ height: px(4) }} />

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
