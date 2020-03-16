import * as React from 'react';
import { View } from 'native-base';
import { Animated } from 'react-native';

interface Props {
    result: Result;
}

const hasChanged = (prev: Result, now: Result) => (
    (
        prev.place !==
        now.place
    ) ||
    (
        prev.result !==
        now.result
    ) ||
    (
        prev.status !==
        now.status
    ) || (
        prev.parsedSplits.map((s) => s.time).join() !==
        now.parsedSplits.map((s) => s.time).join()
    )
);

export const OLResultAnimation: React.SFC<Props> = (props) => {
    const [animation, setAnimation] = React.useState(new Animated.Value(0));
    const [result, setResult] = React.useState(props.result);

    React.useEffect(() => {
        if (hasChanged(props.result, result)) {
            startAnimation();
        }

        setResult(props.result);
    });

    const startAnimation = () => {
        Animated.timing(
            animation,
            {
                toValue: 1,
                duration: 500,
            },
        ).start(stopAnimation);
    };

    const stopAnimation = () => {
        Animated.timing(
            animation,
            {
                toValue: 0,
                duration: 500,
            },
        ).start();
    };

    const backgroundColor = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(0,0,0,0)', 'rgba(255,0,0,.5)'],
    });

    return (
        <Animated.View
            style={{ backgroundColor }}
        >
            {props.children}
        </Animated.View>
    );
};
