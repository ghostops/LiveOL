import * as React from 'react';
import { Split } from 'lib/graphql/fragments/types/Split';
import { View } from 'react-native';
import { OLText } from 'views/components/text';

interface Props {
	split: Split;
	best?: boolean;
}

const BEST_COLOR = '#EA2027';

export const OLSplits: React.FC<Props> = ({ split, best }) => {
	// If the place is 0 the runner hasn't passed the split yet
	if (split.place === 0) {
		return null;
	}

	return (
		<View
			style={{
				flex: 1,
			}}
		>
			<OLText
				font={best ? 'Proxima_Nova_Bold' : 'Proxima_Nova'}
				size={16}
				style={{
					color: best ? BEST_COLOR : 'black',
				}}
			>
				{split.time}{' '}
				<OLText
					font={best ? 'Proxima_Nova_Bold' : 'Proxima_Nova'}
					size={14}
					style={{
						color: best ? BEST_COLOR : 'gray',
					}}
				>
					({split.place})
				</OLText>
			</OLText>

			<OLText
				font={best ? 'Proxima_Nova_Bold' : 'Proxima_Nova'}
				size={14}
				style={{
					color: best ? BEST_COLOR : 'gray',
				}}
			>
				{split.timeplus}
			</OLText>
		</View>
	);
};
