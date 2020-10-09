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
			justifyContent: 'center',
			flex: 1,
		}}
	>
		{Boolean(place.length > 0 && place !== '-') && (
			<Badge
				style={{
					backgroundColor: COLORS.MAIN,
					justifyContent: 'center',
					alignItems: 'center',
					width: 25,
					height: 25,
					borderRadius: 50,
				}}
			>
				<OLText size={12} font="Proxima_Nova" style={{ color: 'white' }}>
					{place}
				</OLText>
			</Badge>
		)}
	</View>
);
