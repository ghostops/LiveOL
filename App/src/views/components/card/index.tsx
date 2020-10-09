import * as React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, px } from 'util/const';

interface Props {
	style?: ViewStyle;
}

export const OLCard: React.FC<Props> = ({ children, style }) => {
	return (
		<View
			style={{
				backgroundColor: 'white',
				borderWidth: 1,
				borderColor: COLORS.BORDER,
				padding: px(15),
				shadowColor: 'black',
				shadowOpacity: 0.1,
				shadowOffset: {
					width: 0,
					height: 2,
				},
				shadowRadius: 2,
				elevation: 5,
				borderRadius: 4,
				...style,
			}}
		>
			{children}
		</View>
	);
};
