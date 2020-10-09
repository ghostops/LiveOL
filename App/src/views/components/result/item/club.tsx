import * as React from 'react';
import { OLText } from '../../text';

interface Props {
	club: string;
}

export const OLResultClub: React.FC<Props> = ({ club }) => (
	<OLText
		numberOfLines={1}
		size={16}
		font="Proxima_Nova"
		style={{
			color: 'grey',
		}}
	>
		{club}
	</OLText>
);
