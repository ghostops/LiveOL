import * as React from 'react';
import { COLORS, px } from 'util/const';
import { connect } from 'react-redux';
import { Grid } from 'react-native-easy-grid';
import { ListItem, View, Text, Badge } from 'native-base';
import { OLResultAnimation } from 'views/components/result/item/animation';
import { OLResultBadge } from 'views/components/result/item/badge';
import { OLResultClub } from 'views/components/result/item/club';
import { OLResultColumn } from 'views/components/result/item/column';
import { OLResultName } from 'views/components/result/item/name';
import { OLResultTime } from 'views/components/result/item/time';
import { OLResultTimeplus } from 'views/components/result/item/timeplus';
import { OLSplits } from 'views/components/result/item/splits';
import { OLStartTime } from 'views/components/result/item/start';
import { Result } from 'lib/graphql/fragments/types/Result';
import { showToast } from 'lib/toasts/competitiorInfo';
import { TouchableOpacity } from 'react-native';
import { OLResultListItem } from '../item/listItem';

interface OwnProps {
    result: Result;
}

type Props = OwnProps;

export const LANDSCAPE_WIDTH = {
    place: px(60),
    name: px(200),
    start: px(100),
    time: px(80),
    splits: px(100),
};

export class OLTableRow extends React.PureComponent<Props> {
    private moreInfo = () => {
        showToast(this.props.result.name, this.props.result.club);
    }

    render() {
        const { result } = this.props;

        return (
            <OLResultAnimation
                result={result}
            >
                <OLResultListItem>
                    <OLResultColumn
                        align="center"
                        style={{ width: LANDSCAPE_WIDTH.place }}
                    >
                        <OLResultBadge place={result.place} />
                    </OLResultColumn>

                    <OLResultColumn style={{ width: LANDSCAPE_WIDTH.name }}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={this.moreInfo}
                        >
                            <OLResultName name={result.name} />

                            <OLResultClub club={result.club} />
                        </TouchableOpacity>
                    </OLResultColumn>

                    <OLResultColumn style={{ width: LANDSCAPE_WIDTH.start }}>
                        <OLStartTime time={result.start} />
                    </OLResultColumn>

                    {
                        result.splits.map((split, index) => {
                            return (
                                <OLResultColumn
                                    style={{ width: LANDSCAPE_WIDTH.splits }}
                                    key={split.id}
                                    align="flex-start"
                                >
                                    <OLSplits split={split} />
                                </OLResultColumn>
                            );
                        })
                    }

                    <OLResultColumn
                        align="flex-end"
                        style={{ width: LANDSCAPE_WIDTH.time }}
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
                </OLResultListItem>
            </OLResultAnimation>
        );
    }
}
