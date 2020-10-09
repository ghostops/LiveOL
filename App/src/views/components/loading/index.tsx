import * as React from 'react';
import { View, Spinner } from 'native-base';
import { COLORS } from 'util/const';

export const OLLoading: React.FC = () => (
	<View
		style={{
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		}}
	>
		<Spinner color={COLORS.MAIN} />
	</View>
);
