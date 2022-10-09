import * as React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View } from 'react-native';

export const OLSafeAreaView: React.FC = ({ children }) => {
	const safeArea = useSafeAreaInsets();
	return (
		<View
			style={{
				paddingLeft: safeArea.left,
				paddingRight: safeArea.right,
				flex: 1,
			}}
		>
			{children}
		</View>
	);
};
