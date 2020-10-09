import * as React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { COLORS, px } from 'util/const';

interface Props {
	style?: ViewStyle;
	onPress: () => any;
}

export const OLListItem: React.FC<Props> = ({ children, style, onPress }) => {
	return (
		<TouchableOpacity
			onPress={onPress}
			style={{
				backgroundColor: 'white',
				padding: px(10),
				borderBottomColor: COLORS.BORDER,
				borderBottomWidth: 1,
				justifyContent: 'center',
				...style,
			}}
		>
			{children}
		</TouchableOpacity>
	);
};
