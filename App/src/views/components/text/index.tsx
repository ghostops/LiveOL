import * as React from 'react';
import { TextStyle, Text } from 'react-native';
import { useRecoilValue } from 'recoil';
import { textSizeMultiplierAtom } from 'store/textSizeMultiplier';
import { fontPx } from 'util/const';

interface Props {
	size: number;
	font: 'Proxima_Nova_Bold' | 'Proxima_Nova' | 'Rift_Bold' | 'Rift_Bold_Italic' | 'PTMono-Regular';
	style?: TextStyle;
	numberOfLines?: number;
	selectable?: boolean;
}

export const OLText: React.FC<Props> = (props) => {
	const textSizeMultiplier = useRecoilValue(textSizeMultiplierAtom);

	return (
		<Text
			{...props}
			style={{
				color: '#141823',
				fontSize: fontPx(props.size * textSizeMultiplier),
				fontFamily: props.font,
				...props.style,
			}}
		>
			{props.children}
		</Text>
	);
};
