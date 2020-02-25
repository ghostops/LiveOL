import * as React from 'react';
import { ListItem, View, Text, Badge } from 'native-base';
import { UNIT, COLORS } from 'util/const';
import { OLResultBadge } from './badge';
import { OLResultColumn } from './column';
import { OLResultName } from './name';
import { OLResultClub } from './club';
import { OLResultTimeplus } from './timeplus';
import { OLResultTime } from './time';
import { OLResultAnimation } from './animation';

interface Props {
    result: Result;
}

export const OLResultItem: React.SFC<Props> = ({ result }) => {
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
                <OLResultColumn
                    style={{ flex: .25 }}
                >
                    <OLResultBadge place={result.place} />
                </OLResultColumn>

                <OLResultColumn
                    style={{ flex: 1 }}
                >
                    <OLResultName name={result.name} />

                    <OLResultClub club={result.club} />
                </OLResultColumn>

                <OLResultColumn
                    style={{
                        flex: .45,
                        alignItems: 'flex-end',
                    }}
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
            </ListItem>
        </OLResultAnimation>
    );
};
