import { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';

type FlashingRedDotProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export const FlashingRedDot: React.FC<FlashingRedDotProps> = ({
  size = 12,
  style,
}) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: 'red',
          opacity,
        },
        style,
      ]}
    />
  );
};
