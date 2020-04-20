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
import { Orientation } from 'expo-screen-orientation';
import { TouchableOpacity } from 'react-native';
import { showToast } from 'lib/toasts/competitiorInfo';
import { isLandscape } from 'util/landscape';

interface OwnProps {
    result: Result;
}

interface StateProps {
    rotation: Orientation;
}

type Props = StateProps & OwnProps;

export const SIZE = {
    landscape: {
        place: 7,
        name: 18,
        start: 12,
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
    const landscape = isLandscape(rotation);
    const size = landscape ? SIZE.landscape : SIZE.portrait;

    const overflowSize = Object.keys(size).map((k) => size[k]).reduce((a, b) => a + b, 0);

    const moreInfo = () => {
        showToast(result.name, result.club);
    };

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
                    // width: 5000,
                }}
            >
                <Grid>
                    <OLResultColumn size={size.place}>
                        <OLResultBadge place={result.place} />
                    </OLResultColumn>

                    <OLResultColumn size={size.name}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={moreInfo}
                        >
                            <OLResultName name={result.name} />

                            <OLResultClub club={result.club} />
                        </TouchableOpacity>
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
