import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Image } from 'react-native';
import { UNIT, HIT_SLOP } from 'util/const';

const LOGO = require('../../../../assets/images/icon.png');

export const Left: React.FC = () => (
	<TouchableOpacity style={{ marginLeft: UNIT }} hitSlop={HIT_SLOP} activeOpacity={1}>
		<Image
			source={LOGO}
			style={{
				width: 42,
				height: '100%',
			}}
			resizeMode="contain"
		/>
	</TouchableOpacity>
);

export const Right: React.FC<{ onPress }> = ({ onPress }) => (
	<TouchableOpacity onPress={onPress} style={{ marginRight: UNIT }} hitSlop={HIT_SLOP}>
		<Ionicons name="md-information-circle" size={24} color="white" />
	</TouchableOpacity>
);
