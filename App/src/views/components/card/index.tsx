import * as React from 'react';
import { View } from 'react-native';

export const OLCard: React.FC = ({ children }) => {
	return (
		<View
			style={{
				backgroundColor: 'white',
			}}
		>
			{children}
		</View>
	);
};
