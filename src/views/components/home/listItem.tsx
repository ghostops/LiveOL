import * as React from 'react';
import { UNIT } from 'util/const';
import { ListItem, Text } from 'native-base';

interface Props {
    competition: Comp;
    index?: number;
    total?: number;
    onCompetitionPress?: (comp: Comp) => void;
}

export const HomeListItem: React.SFC<Props> = ({
    competition,
    index,
    total,
    onCompetitionPress,
}) => {
    return (
        <ListItem
            key={competition.id}
            style={{
                marginLeft: 0,
                paddingHorizontal: UNIT,
                width: '100%',
                borderBottomWidth: index === total - 1 ? 0 : 1,
            }}
            onPress={() => onCompetitionPress && onCompetitionPress(competition)}
        >
            <Text style={{
                fontSize: UNIT,
            }}>
                {competition.name}
            </Text>
        </ListItem>
    );
};
