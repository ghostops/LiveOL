import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Image } from 'react-native';
import { useTheme } from 'hooks/useTheme';

const LOGO = require('../../../../assets/images/icon.png');

export const Left: React.FC = () => {
	const { px } = useTheme();

	return (
		<Image
			source={LOGO}
			style={{
				width: 42,
				height: 42,
				marginLeft: px(16),
			}}
			resizeMode="contain"
		/>
	);
};

export const Right: React.FC<{ onPress }> = ({ onPress }) => {
	const { hitSlop, px } = useTheme();

	return (
		<TouchableOpacity onPress={onPress} style={{ marginRight: px(16) }} hitSlop={hitSlop}>
			<Ionicons name="md-information-circle" size={24} color="white" />
		</TouchableOpacity>
	);
};
