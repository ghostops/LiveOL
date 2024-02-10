import { useEffect, useState } from 'react';
import { Easing, Animated, Dimensions } from 'react-native';
import { COLORS, px } from '~/util/const';

interface Props {
  interval: number;
  promise?: () => Promise<void>;
}

export const OLRefetcherBar: React.FunctionComponent<Props> = ({
  interval,
  promise,
}) => {
  const [animatedWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    const refresh = async (): Promise<void> => {
      await promise?.();
      animate();
    };

    const animate = () => {
      animatedWidth.setValue(0);

      Animated.timing(animatedWidth, {
        toValue: 1,
        duration: interval,
        useNativeDriver: true,
        easing: Easing.linear,
      }).start();
    };

    refresh();

    const timer = setInterval(() => refresh(), interval);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [-Dimensions.get('window').width, 0],
  });

  return (
    <Animated.View
      style={{
        height: px(12),
        width: '100%',
        backgroundColor: COLORS.DARK,
        transform: [{ translateX: width }],
      }}
    />
  );
};
