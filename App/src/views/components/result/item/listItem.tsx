import * as React from 'react';
import { Grid } from 'react-native-easy-grid';
import { View } from 'native-base';
import { px } from 'util/const';

export const OLResultListItem: React.FC = ({ children }) => {
	return (
		<View
			style={{
				flexDirection: 'row',
				marginLeft: 0,
				borderBottomColor: '#e3e3e3',
				borderBottomWidth: 1,
				paddingVertical: px(10),
				paddingRight: px(20),
			}}
		>
			<Grid>{children}</Grid>
		</View>
	);
};
