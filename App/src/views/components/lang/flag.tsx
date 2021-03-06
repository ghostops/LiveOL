import * as React from 'react';
import { Image, ImageStyle } from 'react-native';

interface Props {
	code: string;
	size: number;
	style?: ImageStyle;
}

const remapCode = {
	en: 'gb',
	sv: 'se',
	no: 'no',
	sr: 'rs',
};

const FLAGS = {
	se: require('../../../../assets/images/flags/se.png'),
	no: require('../../../../assets/images/flags/no.png'),
	gb: require('../../../../assets/images/flags/gb.png'),
	rs: require('../../../../assets/images/flags/rs.png'),
};

export const OLFlag: React.FC<Props> = ({ code, size, style }) => {
	const flag = FLAGS[remapCode[code]];

	if (!flag) {
		return null;
	}
	return (
		<Image
			source={flag}
			style={{
				height: size * 0.65,
				width: size,
				...style,
			}}
		/>
	);
};
