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
import { ScreenOrientation } from 'expo';
import { showToast } from 'lib/toasts/competitiorInfo';
import { TouchableOpacity } from 'react-native';

interface OwnProps {
    result: Result;
}

type Props = OwnProps;

const tmpW = px(200);

export const OLTableRow: React.SFC<Props> = ({ result }) => {
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
                }}
            >
                <Grid>
                    <OLResultColumn style={{ width: tmpW }}>
                        <OLResultBadge place={result.place} />
                    </OLResultColumn>

                    <OLResultColumn style={{ width: tmpW }}>
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={moreInfo}
                        >
                            <OLResultName name={result.name} />

                            <OLResultClub club={result.club} />
                        </TouchableOpacity>
                    </OLResultColumn>

                    <OLResultColumn style={{ width: tmpW }}>
                        <OLStartTime time={result.start} />
                    </OLResultColumn>

                    {
                        result.splits.map((split, index) => {
                            return (
                                <OLResultColumn
                                    style={{ width: tmpW }}
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
                        style={{ width: tmpW }}
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
