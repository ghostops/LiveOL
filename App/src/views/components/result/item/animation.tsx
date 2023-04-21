import React from 'react';
import { Animated, ViewStyle } from 'react-native';
import { resultsChanged } from 'util/hasChanged';
import { OlResult } from 'lib/graphql/generated/types';

interface Props {
  result: OlResult;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const OLResultAnimation: React.FC<Props> = props => {
  const [animation] = React.useState(new Animated.Value(0));
  const [result, setResult] = React.useState(props.result);

  React.useEffect(() => {
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

    if (resultsChanged(props.result, result)) {
      startAnimation();
    }

    setResult(props.result);
  }, [animation, props.result, result]);

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', 'rgba(255,0,0,.25)'],
  });

  return (
    <Animated.View style={{ backgroundColor, ...props.style }}>
      {props.children}
    </Animated.View>
  );
};
