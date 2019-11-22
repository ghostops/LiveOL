import * as React from 'react';
import { fontPx, px } from 'util/const';
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
                paddingHorizontal: px(16),
                width: '100%',
                borderBottomWidth: index === total - 1 ? 0 : 1,
            }}
            onPress={() => onCompetitionPress && onCompetitionPress(competition)}
        >
            <Text style={{
                fontSize: fontPx(16),
            }}>
                {competition.name}
            </Text>
        </ListItem>
    );
};
