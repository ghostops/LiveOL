import { useRef, useState } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { paths } from '~/lib/react-query/schema';

interface Props {
  result: paths['/v1/results/{competitionId}/club/{clubName}']['get']['responses']['200']['content']['application/json']['data']['results'][0];
  children: React.ReactNode;
  style?: ViewStyle;
}

export const OLResultAnimation: React.FC<Props> = props => {
  const [animation] = useState(new Animated.Value(0));
  const animationActive = useRef(false);

  const stopAnimation = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const startAnimation = () => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const backgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,0)', 'rgba(255,0,0,.15)'],
  });

  if (!animationActive.current) {
    if (props.result.hasUpdated === true) {
      animationActive.current = true;
      startAnimation();
    }
  }

  if (animationActive.current) {
    if (props.result.hasUpdated === false) {
      animationActive.current = false;
      stopAnimation();
    }
  }

  return (
    <Animated.View
      style={{
        backgroundColor,
        ...props.style,
      }}
    >
      {props.children}
    </Animated.View>
  );
};
