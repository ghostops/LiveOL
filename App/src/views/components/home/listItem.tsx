import * as React from 'react';
import { fontPx, px } from 'util/const';
import { ListItem } from 'native-base';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { OLText } from '../text';

interface Props {
    competition: Competition;
    index?: number;
    total?: number;
    onCompetitionPress?: (comp: Competition) => void;
}

export const HomeListItem: React.FC<Props> = ({
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
            <OLText
                size={16}
                font="Proxima_Nova"
            >
                {competition.name}
            </OLText>
        </ListItem>
    );
};
