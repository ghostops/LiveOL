import * as React from 'react';
import { px } from 'util/const';
import { Competition } from 'lib/graphql/fragments/types/Competition';
import { OLText } from '../text';
import { OLListItem } from '../list/item';

interface Props {
	competition: Competition;
	index?: number;
	total?: number;
	onCompetitionPress?: (comp: Competition) => void;
}

export const HomeListItem: React.FC<Props> = ({ competition, index, total, onCompetitionPress }) => {
	return (
		<OLListItem
			key={competition.id}
			style={{
				marginLeft: 0,
				paddingHorizontal: px(16),
				paddingVertical: px(12),
				width: '100%',
				borderBottomWidth: index === total - 1 ? 0 : 1,
			}}
			onPress={() => onCompetitionPress && onCompetitionPress(competition)}
		>
			<OLText size={16} font="Proxima_Nova">
				{competition.name}
			</OLText>
		</OLListItem>
	);
};
