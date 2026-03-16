import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OrientationType } from 'react-native-orientation-locker';
import { useOrientation } from '~/hooks/useOrientation';

export const useRowWidths = () => {
  const orientation = useOrientation();
  const { left, right } = useSafeAreaInsets();
  const [deviceWidth, setDeviceWidth] = useState(
    Dimensions.get('window').width,
  );

  useEffect(() => {
    const handleResize = () => {
      setDeviceWidth(Dimensions.get('window').width);
    };

    const subscription = Dimensions.addEventListener('change', handleResize);

    return () => {
      subscription.remove();
    };
  }, []);

  const sizes: Partial<
    Record<
      OrientationType,
      { place: number; name: number; time: number; splits: number }
    >
  > = {
    [OrientationType.PORTRAIT]: {
      place: deviceWidth * 0.15,
      name: deviceWidth * 0.6,
      time: deviceWidth * 0.25,
      splits: deviceWidth * 0.25,
    },
    [OrientationType['LANDSCAPE-LEFT']]: {
      place: deviceWidth * 0.05 + left,
      name: deviceWidth * 0.3,
      time: deviceWidth * 0.15,
      splits: deviceWidth * 0.15,
    },
    [OrientationType['LANDSCAPE-RIGHT']]: {
      place: deviceWidth * 0.05,
      name: deviceWidth * 0.3,
      time: deviceWidth * 0.15 + right,
      splits: deviceWidth * 0.15,
    },
  };

  const currentSizes = sizes[orientation] || sizes[OrientationType.PORTRAIT];

  return {
    deviceWidth,
    ...currentSizes,
  };
};
