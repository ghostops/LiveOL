import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Easing, Animated, Dimensions } from 'react-native';
import { COLORS, px } from '~/util/const';

interface Props {
  interval: number;
  refetch: () => Promise<void>;
}

export const OLRefetcherBar: React.FunctionComponent<Props> = ({
  interval,
  refetch,
}) => {
  const [animatedWidth] = useState(new Animated.Value(0));

  useEffect(() => {
    const refresh = async (): Promise<void> => {
      await refetch();
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

  const [windowWidth, setWindowWidth] = useState(
    Dimensions.get('window').width,
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => {
      subscription?.remove();
    };
  }, []);

  const width = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: [-windowWidth, 0],
  });

  return (
    <View style={{ width: '100%', overflow: 'hidden' }}>
      <Animated.View
        style={{
          height: px(12),
          width: '100%',
          backgroundColor: COLORS.DARK,
          transform: [{ translateX: width }],
        }}
      />
    </View>
  );
};
