import * as React from 'react';
import { TouchableOpacity, Easing, Animated } from 'react-native';
import { COLORS, px } from 'util/const';
import { Lang } from 'lib/lang';
import { OLText } from '../text';

interface Props {
	interval: number;
	promise?: () => Promise<void>;
}

export const OLRefetcherBar: React.FunctionComponent<Props> = ({ interval, promise }) => {
	const [isAnimating, setIsAnimating] = React.useState(false);
	const [animatedWidth] = React.useState(new Animated.Value(0));
	const [animatedHint] = React.useState(new Animated.Value(0));

	React.useEffect(() => {
		const refresh = async (): Promise<void> => {
			await promise();
			animate();
		};

		const animate = () => {
			animatedWidth.setValue(0);

			Animated.timing(animatedWidth, {
				toValue: 1,
				duration: interval,
				useNativeDriver: false,
				easing: Easing.linear,
			}).start();
		};

		void refresh();

		const timer = setInterval(() => void refresh(), interval);

		return () => clearInterval(timer);
	}, []);

	const getHint = async () => {
		if (isAnimating) return;
		setIsAnimating(true);
		const duration = 500;
		Animated.timing(animatedHint, { toValue: 1, duration, useNativeDriver: false }).start();
		await new Promise((r) => setTimeout(r, 2000));
		Animated.timing(animatedHint, { toValue: 0, duration, useNativeDriver: false }).start();
		setIsAnimating(false);
	};

	const width = animatedWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
	const height = animatedHint.interpolate({ inputRange: [0, 1], outputRange: [px(12), px(22)] });

	return (
		<TouchableOpacity onPress={getHint} activeOpacity={1}>
			<Animated.View style={{ height, width, backgroundColor: COLORS.DARK }}></Animated.View>

			<Animated.View
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					justifyContent: 'center',
					alignItems: 'center',
					transform: [{ scale: animatedHint }],
				}}
			>
				<OLText font="Proxima_Nova" size={14} style={{ backgroundColor: 'white' }}>
					{Lang.print('classes.timerHint')}
				</OLText>
			</Animated.View>
		</TouchableOpacity>
	);
};
