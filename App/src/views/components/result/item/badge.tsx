import * as React from 'react';
import { View, Badge } from 'native-base';
import { COLORS } from 'util/const';
import { OLText } from '../../../components/text';

interface Props {
	place: string;
}

export const OLResultBadge: React.FC<Props> = ({ place }) => (
	<View
		style={{
			alignItems: 'center',
			justifyContent: 'flex-start',
			flex: 1,
		}}>
		{Boolean(place.length > 0 && place !== '-') && (
			<Badge style={{ backgroundColor: COLORS.MAIN, justifyContent: 'center', alignItems: 'center' }}>
				<OLText size={12} font="Proxima_Nova" style={{ color: 'white' }}>
					{place}
				</OLText>
			</Badge>
		)}
	</View>
);
