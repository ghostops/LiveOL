import * as React from 'react';
import { View } from 'react-native';
import { COLORS, px } from 'util/const';
import { OLText } from 'views/components/text';
import { Svg, Path } from 'react-native-svg';

interface Props {
	name: string;
}

export const OLCompetitionIOSHeader: React.FC<Props> = ({ name }) => (
	<>
		<View>
			<View
				style={{
					height: 1000,
					width: 1000,
					position: 'absolute',
					top: -1000,
					left: -100,
					backgroundColor: COLORS.MAIN,
				}}
			/>

			<View
				style={{
					backgroundColor: COLORS.MAIN,
					zIndex: 1,
					elevation: 1,
					paddingVertical: px(15),
				}}
			>
				<OLText
					size={42}
					font="Rift_Bold"
					style={{
						paddingHorizontal: px(15),
						textAlign: 'center',
						color: 'white',
					}}
				>
					{name}
				</OLText>
			</View>

			<Svg
				viewBox="0 0 1440 320"
				width="720"
				height="160"
				style={{
					top: -px(80),
					width: '100%',
					zIndex: 0,
					elevation: 0,
				}}
			>
				<Path
					fill={COLORS.MAIN}
					fill-opacity="1"
					d="M0,224L60,218.7C120,213,240,203,360,202.7C480,203,600,213,720,208C840,203,960,181,1080,181.3C1200,181,1320,203,1380,213.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
				/>
			</Svg>
		</View>

		{/* Negative margin for the SVG */}
		<View style={{ marginTop: -px(120) }} />
	</>
);
