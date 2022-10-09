import * as React from 'react';
import { Animated } from 'react-native';
import { Result } from 'lib/graphql/fragments/types/Result';
import { resultsChanged } from 'util/hasChanged';

interface Props {
	result: Result;
}

export const OLResultAnimation: React.FC<Props> = (props) => {
	const [animation] = React.useState(new Animated.Value(0));
	const [result, setResult] = React.useState(props.result);

	React.useEffect(() => {
		if (resultsChanged(props.result, result)) {
			startAnimation();
		}

		setResult(props.result);
	}, [props.result, result]);

	const startAnimation = () => {
		Animated.timing(animation, {
			toValue: 1,
			duration: 500,
			useNativeDriver: false,
		}).start(() => {
			setTimeout(() => stopAnimation(), 5000);
		});
	};

	const stopAnimation = () => {
		Animated.timing(animation, {
			toValue: 0,
			duration: 500,
			useNativeDriver: false,
		}).start();
	};

	const backgroundColor = animation.interpolate({
		inputRange: [0, 1],
		outputRange: ['rgba(0,0,0,0)', 'rgba(255,0,0,.25)'],
	});

	return <Animated.View style={{ backgroundColor }}>{props.children}</Animated.View>;
};
