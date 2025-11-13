import { useRef, useState } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props {
  hasUpdated: boolean;
  isTracking?: boolean;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const OLResultAnimation: React.FC<Props> = props => {
  const color = props.isTracking
    ? 'rgba(236, 223, 208, 1)'
    : 'rgba(255,255,255,1)';
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
    outputRange: [color, 'rgba(255,0,0,.15)'],
  });

  if (!animationActive.current) {
    if (props.hasUpdated === true) {
      animationActive.current = true;
      startAnimation();
    }
  }

  if (animationActive.current) {
    if (props.hasUpdated === false) {
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
